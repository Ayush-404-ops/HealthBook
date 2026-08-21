import { useEffect, useState, useRef } from 'react';
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

// Helper: fetch route from OSRM and build a graph for Dijkstra
async function fetchRouteAndRunDijkstra(fromLat, fromLng, toLat, toLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('OSRM API request failed');
  const data = await res.json();

  if (!data.routes || data.routes.length === 0) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const steps = route.legs[0].steps;

  // Build adjacency graph from OSRM steps for Dijkstra
  const graph = {};
  steps.forEach((step, i) => {
    const fromNode = `node_${i}`;
    const toNode = `node_${i + 1}`;
    if (!graph[fromNode]) graph[fromNode] = [];
    if (!graph[toNode]) graph[toNode] = [];
    graph[fromNode].push({ to: toNode, weight: step.distance });
  });

  // Run Dijkstra from the first node to the last
  const startNode = 'node_0';
  const endNode = `node_${steps.length}`;
  const { previous, distances } = dijkstra(graph, startNode);
  const shortestPath = getPath(previous, endNode);

  // Convert OSRM GeoJSON coordinates [lng, lat] → Leaflet [lat, lng]
  const polylineCoords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  return {
    polylineCoords,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
    dijkstraPath: shortestPath,
    dijkstraDistance: distances[endNode],
  };
}

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
        hospital.lat, hospital.lng
      );
      setRoute(result.polylineCoords);
      setRouteInfo({
        distanceKm: (result.distanceMeters / 1000).toFixed(1),
        durationMin: Math.ceil(result.durationSeconds / 60),
        dijkstraPath: result.dijkstraPath,
        dijkstraDistance: Math.round(result.dijkstraDistance),
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow p-8 max-w-md text-center">
          <span className="text-5xl">📍</span>
          <h2 className="text-xl font-bold mt-4 text-gray-800">Location Required</h2>
          <p className="text-gray-500 mt-2">{locationError}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🌐</div>
          <p className="text-gray-600 font-medium">Detecting your location…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏥 Nearby Hospitals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Showing hospitals within 5 km of your location
          </p>
        </div>
        {selectedHospital && (
          <button
            onClick={clearRoute}
            className="text-sm text-red-500 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            ✕ Clear Route
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
        {/* Left panel — hospital list */}
        <div className="w-full lg:w-80 bg-white border-r overflow-y-auto flex-shrink-0">
          {hospitalsLoading && (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-pulse text-3xl mb-2">🔍</div>
              <p className="text-sm">Searching for hospitals…</p>
            </div>
          )}

          {hospitalsError && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {hospitalsError}
            </div>
          )}

          {!hospitalsLoading && !hospitalsError && hospitals.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p className="text-3xl mb-2">🏥</p>
              <p className="text-sm">No hospitals found within 5 km.</p>
            </div>
          )}

          {hospitals.map((h) => (
            <div
              key={h.id}
              onClick={() => handleHospitalClick(h)}
              className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition ${
                selectedHospital?.id === h.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <p className="font-semibold text-gray-800 text-sm">{h.name}</p>
              {h.emergency && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Emergency: {h.emergency}
                </span>
              )}
              {h.phone && (
                <p className="text-xs text-gray-400 mt-1">📞 {h.phone}</p>
              )}
              <p className="text-xs text-blue-500 mt-1">Click to show route →</p>
            </div>
          ))}
        </div>

        {/* Right panel — map + route info */}
        <div className="flex-1 flex flex-col">
          {/* Map */}
          <div className="flex-1">
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
                    {h.phone && <p className="text-xs mt-1">📞 {h.phone}</p>}
                    <button
                      onClick={() => handleHospitalClick(h)}
                      className="mt-2 text-xs text-blue-600 underline block"
                    >
                      Get directions
                    </button>
                  </Popup>
                </Marker>
              ))}

              {/* Route polyline */}
              {route.length > 0 && (
                <Polyline positions={route} color="#3B82F6" weight={5} opacity={0.8} />
              )}
            </MapContainer>
          </div>

          {/* Route info bar */}
          {(routeLoading || routeInfo || routeError) && (
            <div className="bg-white border-t px-6 py-4">
              {routeLoading && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Calculating shortest route using Dijkstra's algorithm…
                </div>
              )}

              {routeError && (
                <p className="text-red-500 text-sm">{routeError}</p>
              )}

              {routeInfo && selectedHospital && (
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Destination</p>
                    <p className="font-semibold text-gray-800">{selectedHospital.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Distance</p>
                    <p className="font-semibold text-gray-800">{routeInfo.distanceKm} km</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Est. Drive Time</p>
                    <p className="font-semibold text-gray-800">{routeInfo.durationMin} min</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Dijkstra Path</p>
                    <p className="text-xs text-gray-500 font-mono">
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
