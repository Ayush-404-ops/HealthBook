import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { dijkstra, getPath } from '../utils/dijkstra.js';

// Fix Leaflet's default marker icon broken by Vite's asset pipeline
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red icon for user's current location
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom green icon for hospitals
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom blue icon for the selected hospital
const selectedHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Helper: re-centers the map whenever the center prop changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

// Helper: fetch hospitals near a lat/lng using the Overpass API
async function fetchNearbyHospitals(lat, lng, radiusMeters = 5000) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error('Overpass API request failed');
  const data = await res.json();

  return data.elements
    .map((el) => ({
      id: el.id,
      name: el.tags?.name || 'Unnamed Hospital',
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
      phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
      emergency: el.tags?.emergency || null,
    }))
    .filter((h) => h.lat && h.lng); // drop any with missing coordinates
}

// Helper: fetch route from OSRM with alternatives and build an intersection graph for real Dijkstra pathfinding
async function fetchRouteAndRunDijkstra(fromLat, fromLng, toLat, toLng, hospitalName = 'Hospital') {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM API request failed');
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const startNode = 'Start Location';
  const endNode = `Dest: ${hospitalName}`;
  const graph = { [startNode]: [], [endNode]: [] };
  const nodeNames = { [startNode]: 'Your Location', [endNode]: hospitalName };

  // Helper to format coordinate keys so shared intersections between alternative routes merge
  const toKey = ([lng, lat]) => `loc_${lat.toFixed(4)}_${lng.toFixed(4)}`;

  // Process all alternative routes returned by OSRM to construct a genuine multi-path network graph
  data.routes.forEach((route) => {
    const steps = route.legs?.[0]?.steps || [];
    if (steps.length === 0) return;

    let prevNode = startNode;

    steps.forEach((step, stepIdx) => {
      const isLast = stepIdx === steps.length - 1;
      const coord = step.maneuver?.location;
      const nodeId = isLast ? endNode : toKey(coord);
      const streetName = step.name || `Junction ${stepIdx + 1}`;

      if (!graph[nodeId]) graph[nodeId] = [];
      if (!nodeNames[nodeId]) nodeNames[nodeId] = streetName;

      // Add edge from prevNode to nodeId with distance weight
      const existingEdge = graph[prevNode].find((e) => e.to === nodeId);
      if (!existingEdge) {
        graph[prevNode].push({ to: nodeId, weight: Math.round(step.distance) });
      } else if (step.distance < existingEdge.weight) {
        // If an alternative route offers a shorter segment between same junctions, use shorter weight
        existingEdge.weight = Math.round(step.distance);
      }

      prevNode = nodeId;
    });

    // Ensure connection to endNode
    if (prevNode !== endNode) {
      if (!graph[prevNode].some((e) => e.to === endNode)) {
        graph[prevNode].push({ to: endNode, weight: 0 });
      }
    }
  });

  // Run Dijkstra on the combined multi-route intersection network graph
  const { previous, distances } = dijkstra(graph, startNode);
  const rawPath = getPath(previous, endNode);

  // Convert node IDs to friendly street/junction names (deduplicating adjacent identical names)
  const friendlyPath = rawPath
    .map((id) => nodeNames[id] || id)
    .filter((name, idx, arr) => idx === 0 || name !== arr[idx - 1]);

  // Identify the best route matching Dijkstra's shortest distance
  let selectedRoute = data.routes[0];
  let minDiff = Infinity;
  const dijkstraDist = distances[endNode] || selectedRoute.distance;

  data.routes.forEach((r) => {
    const diff = Math.abs(r.distance - dijkstraDist);
    if (diff < minDiff) {
      minDiff = diff;
      selectedRoute = r;
    }
  });

  // Convert GeoJSON coordinates [lng, lat] → Leaflet [lat, lng]
  const polylineCoords = selectedRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    polylineCoords,
    distanceMeters: selectedRoute.distance,
    durationSeconds: selectedRoute.duration,
    dijkstraPath: friendlyPath,
    dijkstraDistance: Math.round(dijkstraDist),
    alternativesEvaluated: data.routes.length,
  };
}

/* ── Inline styles (replaces Tailwind utility classes) ─────────── */
const styles = {
  fullPage: {
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredCard: {
    background: 'var(--clr-bg-card)',
    border: '1px solid var(--clr-border)',
    borderRadius: 'var(--r-xl)',
    padding: 'var(--sp-10)',
    maxWidth: '440px',
    textAlign: 'center',
    boxShadow: 'var(--shadow-md)',
  },
  headerBar: {
    background: 'var(--clr-bg-card)',
    borderBottom: '1px solid var(--clr-border)',
    padding: 'var(--sp-4) var(--sp-6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageWrap: {
    minHeight: 'calc(100vh - 70px)',
    background: 'var(--clr-bg)',
  },
  columns: {
    display: 'flex',
    height: 'calc(100vh - 70px - 65px)',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
    background: 'var(--clr-bg-card)',
    borderRight: '1px solid var(--clr-border)',
    overflowY: 'auto',
  },
  hospitalItem: (isSelected) => ({
    padding: 'var(--sp-4)',
    borderBottom: '1px solid var(--clr-border)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
    background: isSelected ? 'var(--clr-primary-glow)' : 'transparent',
    borderLeft: isSelected ? '4px solid var(--clr-primary)' : '4px solid transparent',
  }),
  hospitalName: {
    fontWeight: 600,
    color: 'var(--clr-text)',
    fontSize: '0.88rem',
  },
  emergencyBadge: {
    display: 'inline-block',
    marginTop: '4px',
    fontSize: '0.72rem',
    background: 'rgba(255, 107, 107, 0.15)',
    color: 'var(--clr-danger)',
    padding: '2px 8px',
    borderRadius: 'var(--r-full)',
  },
  phoneLine: {
    fontSize: '0.75rem',
    color: 'var(--clr-text-dim)',
    marginTop: '4px',
  },
  clickHint: {
    fontSize: '0.75rem',
    color: 'var(--clr-primary)',
    marginTop: '4px',
  },
  routeBar: {
    background: 'var(--clr-bg-card)',
    borderTop: '1px solid var(--clr-border)',
    padding: 'var(--sp-4) var(--sp-6)',
  },
  routeGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--sp-8)',
  },
  routeLabel: {
    fontSize: '0.7rem',
    color: 'var(--clr-text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  routeValue: {
    fontWeight: 700,
    color: 'var(--clr-text)',
  },
  dijkstraValue: {
    fontSize: '0.75rem',
    color: 'var(--clr-text-muted)',
    fontFamily: 'monospace',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid var(--clr-primary)',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
};

export default function NearbyHospitals() {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalsError, setHospitalsError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Step 1: get user's GPS location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please allow location access and refresh.'
            : 'Unable to retrieve your location. Please try again.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Step 2: once we have location, fetch nearby hospitals
  useEffect(() => {
    if (!location) return;
    setHospitalsLoading(true);
    setHospitalsError(null);
    fetchNearbyHospitals(location.lat, location.lng)
      .then(setHospitals)
      .catch(() => setHospitalsError('Failed to fetch nearby hospitals. Please try again.'))
      .finally(() => setHospitalsLoading(false));
  }, [location]);

  // Step 3: when a hospital is clicked, fetch route and run Dijkstra
  const handleHospitalClick = async (hospital) => {
    setSelectedHospital(hospital);
    setRoute([]);
    setRouteInfo(null);
    setRouteError(null);
    setRouteLoading(true);
    try {
      const result = await fetchRouteAndRunDijkstra(
        location.lat, location.lng,
        hospital.lat, hospital.lng,
        hospital.name
      );
      setRoute(result.polylineCoords);
      setRouteInfo({
        distanceKm: (result.distanceMeters / 1000).toFixed(1),
        durationMin: Math.ceil(result.durationSeconds / 60),
        dijkstraPath: result.dijkstraPath,
        dijkstraDistance: Math.round(result.dijkstraDistance),
        alternativesEvaluated: result.alternativesEvaluated,
      });
    } catch {
      setRouteError('Could not calculate route. The hospital may be unreachable by road.');
    } finally {
      setRouteLoading(false);
    }
  };

  const clearRoute = () => {
    setSelectedHospital(null);
    setRoute([]);
    setRouteInfo(null);
    setRouteError(null);
  };

  // --- RENDER ---

  if (locationError) {
    return (
      <div style={styles.fullPage}>
        <div style={styles.centeredCard} className="animate-fade-up">
          <span style={{ fontSize: '3.5rem' }}>📍</span>
          <h2 style={{ marginTop: 'var(--sp-4)' }}>Location Required</h2>
          <p style={{ marginTop: 'var(--sp-2)' }}>{locationError}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div style={styles.fullPage}>
        <div style={{ textAlign: 'center' }} className="animate-fade-up">
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--sp-4)', animation: 'spin 2s linear infinite' }}>🌐</div>
          <p style={{ fontWeight: 500 }}>Detecting your location…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrap}>
      {/* Header */}
      <div style={styles.headerBar}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>🏥 Nearby Hospitals</h1>
          <p style={{ fontSize: '0.85rem', marginTop: '2px' }}>
            Showing hospitals within 5 km of your location
          </p>
        </div>
        {selectedHospital && (
          <button onClick={clearRoute} className="btn btn-danger btn-sm">
            ✕ Clear Route
          </button>
        )}
      </div>

      <div style={styles.columns}>
        {/* Left panel — hospital list */}
        <div style={styles.sidebar}>
          {hospitalsLoading && (
            <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)', animation: 'pulse-glow 1.5s infinite' }}>🔍</div>
              <p style={{ fontSize: '0.85rem' }}>Searching for hospitals…</p>
            </div>
          )}

          {hospitalsError && (
            <div className="alert alert-error" style={{ margin: 'var(--sp-4)' }}>
              {hospitalsError}
            </div>
          )}

          {!hospitalsLoading && !hospitalsError && hospitals.length === 0 && (
            <div style={{ padding: 'var(--sp-6)', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: 'var(--sp-2)' }}>🏥</p>
              <p style={{ fontSize: '0.85rem' }}>No hospitals found within 5 km.</p>
            </div>
          )}

          {hospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => handleHospitalClick(h)}
              style={styles.hospitalItem(selectedHospital?.id === h.id)}
              onMouseEnter={(e) => {
                if (selectedHospital?.id !== h.id) e.currentTarget.style.background = 'var(--clr-surface)';
              }}
              onMouseLeave={(e) => {
                if (selectedHospital?.id !== h.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <p style={styles.hospitalName}>{h.name}</p>
              {h.emergency && (
                <span style={styles.emergencyBadge}>
                  Emergency: {h.emergency}
                </span>
              )}
              {h.phone && (
                <p style={styles.phoneLine}>📞 {h.phone}</p>
              )}
              <p style={styles.clickHint}>Click to show route →</p>
            </div>
          ))}
        </div>

        {/* Right panel — map + route info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Map */}
          <div style={{ flex: 1 }}>
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <RecenterMap center={[location.lat, location.lng]} />

              {/* User's location */}
              <Marker position={[location.lat, location.lng]} icon={userIcon}>
                <Popup>
                  <strong>📍 You are here</strong>
                </Popup>
              </Marker>

              {/* Hospital markers */}
              {hospitals.map((h) => (
                <Marker
                  key={h.id}
                  position={[h.lat, h.lng]}
                  icon={selectedHospital?.id === h.id ? selectedHospitalIcon : hospitalIcon}
                  eventHandlers={{ click: () => handleHospitalClick(h) }}
                >
                  <Popup>
                    <strong>{h.name}</strong>
                    {h.phone && <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>📞 {h.phone}</p>}
                    <button
                      onClick={() => handleHospitalClick(h)}
                      style={{
                        marginTop: '8px',
                        fontSize: '0.75rem',
                        color: 'var(--clr-accent)',
                        textDecoration: 'underline',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'block',
                      }}
                    >
                      Get directions
                    </button>
                  </Popup>
                </Marker>
              ))}

              {/* Route polyline */}
              {route.length > 0 && (
                <Polyline positions={route} color="#00d4aa" weight={5} opacity={0.8} />
              )}
            </MapContainer>
          </div>

          {/* Route info bar */}
          {(routeLoading || routeInfo || routeError) && (
            <div style={styles.routeBar}>
              {routeLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                  <div style={styles.spinner} />
                  Calculating shortest route using Dijkstra's algorithm…
                </div>
              )}

              {routeError && (
                <p style={{ color: 'var(--clr-danger)', fontSize: '0.85rem' }}>{routeError}</p>
              )}

              {routeInfo && selectedHospital && (
                <div style={styles.routeGrid}>
                  <div>
                    <p style={styles.routeLabel}>Destination</p>
                    <p style={styles.routeValue}>{selectedHospital.name}</p>
                  </div>
                  <div>
                    <p style={styles.routeLabel}>Distance</p>
                    <p style={styles.routeValue}>{routeInfo.distanceKm} km</p>
                  </div>
                  <div>
                    <p style={styles.routeLabel}>Est. Drive Time</p>
                    <p style={styles.routeValue}>{routeInfo.durationMin} min</p>
                  </div>
                  <div>
                    <p style={styles.routeLabel}>
                      Dijkstra Path {routeInfo.alternativesEvaluated > 1 ? `(${routeInfo.alternativesEvaluated} alternatives evaluated)` : ''}
                    </p>
                    <p style={styles.dijkstraValue}>
                      {routeInfo.dijkstraPath.join(' → ')} ({routeInfo.dijkstraDistance} m)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
