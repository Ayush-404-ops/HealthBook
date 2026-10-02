import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { dijkstra, getPath } from '../utils/dijkstra.js';
import { PublicLayout } from '../components/layout/PublicLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Compass,
  AlertCircle,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const selectedHospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -34],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

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
    .filter((h) => h.lat && h.lng);
}

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

  const toKey = ([lng, lat]) => `loc_${lat.toFixed(4)}_${lng.toFixed(4)}`;

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

      const existingEdge = graph[prevNode].find((e) => e.to === nodeId);
      if (!existingEdge) {
        graph[prevNode].push({ to: nodeId, weight: Math.round(step.distance) });
      } else if (step.distance < existingEdge.weight) {
        existingEdge.weight = Math.round(step.distance);
      }

      prevNode = nodeId;
    });

    if (prevNode !== endNode) {
      if (!graph[prevNode].some((e) => e.to === endNode)) {
        graph[prevNode].push({ to: endNode, weight: 0 });
      }
    }
  });

  const { previous, distances } = dijkstra(graph, startNode);
  const rawPath = getPath(previous, endNode);

  const friendlyPath = rawPath
    .map((id) => nodeNames[id] || id)
    .filter((name, idx, arr) => idx === 0 || name !== arr[idx - 1]);

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

  const getCurrentGPS = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocationError(
          err.code === 1
            ? 'Location access denied. Please allow location access in your browser settings.'
            : 'Unable to retrieve your location. Please check GPS settings.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getCurrentGPS();
  }, []);

  useEffect(() => {
    if (!location) return;
    setHospitalsLoading(true);
    setHospitalsError(null);
    fetchNearbyHospitals(location.lat, location.lng)
      .then(setHospitals)
      .catch(() => setHospitalsError('Failed to fetch nearby hospitals.'))
      .finally(() => setHospitalsLoading(false));
  }, [location]);

  const handleHospitalClick = async (hospital) => {
    setSelectedHospital(hospital);
    setRoute([]);
    setRouteInfo(null);
    setRouteError(null);
    setRouteLoading(true);
    try {
      const result = await fetchRouteAndRunDijkstra(
        location.lat,
        location.lng,
        hospital.lat,
        hospital.lng,
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
      setRouteError('Could not calculate route for this hospital.');
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

  if (locationError) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex items-center justify-center p-6">
          <Card className="max-w-md p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Location Required
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {locationError}
            </p>
            <Button variant="primary" onClick={getCurrentGPS} icon={Compass}>
              Retry GPS Location
            </Button>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  if (!location) {
    return (
      <PublicLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Detecting your GPS location for emergency routing...
          </p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="relative h-[calc(100vh-70px)] w-full flex flex-col md:flex-row overflow-hidden">
        {/* Floating Side Panel listing hospitals */}
        <aside className="w-full md:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shadow-2xl h-1/2 md:h-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge status="cancelled" className="bg-rose-500 text-white font-bold animate-pulse">
                  SOS
                </Badge>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Nearby Emergency Hospitals
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {hospitals.length} facilities within 5 km
              </p>
            </div>

            {/* Red Animated Locate Me Button */}
            <button
              type="button"
              onClick={getCurrentGPS}
              className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/30 animate-pulse transition-transform active:scale-95"
              title="Locate Me"
            >
              <Compass className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2 space-y-1">
            {hospitalsLoading ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-500" />
                <p>Searching OpenStreetMap Overpass API...</p>
              </div>
            ) : hospitalsError ? (
              <div className="p-4 text-xs font-semibold text-rose-500 text-center">
                {hospitalsError}
              </div>
            ) : hospitals.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No hospitals found within 5 km radius.
              </div>
            ) : (
              hospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleHospitalClick(h)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all flex flex-col gap-1 border ${
                      isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 dark:border-teal-500 shadow-md'
                        : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {h.name}
                      </h4>
                      {h.emergency && (
                        <Badge status="cancelled" className="text-[10px]">
                          24/7 ER
                        </Badge>
                      )}
                    </div>
                    {h.phone && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-teal-500" />
                        <span>{h.phone}</span>
                      </div>
                    )}
                    <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 mt-1">
                      <Navigation className="w-3 h-3" /> Get Shortest Dijkstra Route
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative h-1/2 md:h-full w-full">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={14}
            className="h-full w-full z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={[location.lat, location.lng]} />

            {/* User Location */}
            <Marker position={[location.lat, location.lng]} icon={userIcon}>
              <Popup>
                <div className="text-xs font-bold">📍 Your GPS Location</div>
              </Popup>
            </Marker>

            {/* Hospital Markers */}
            {hospitals.map((h) => (
              <Marker
                key={h.id}
                position={[h.lat, h.lng]}
                icon={selectedHospital?.id === h.id ? selectedHospitalIcon : hospitalIcon}
                eventHandlers={{ click: () => handleHospitalClick(h) }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <div className="font-bold">{h.name}</div>
                    {h.phone && <div>📞 {h.phone}</div>}
                    <button
                      type="button"
                      onClick={() => handleHospitalClick(h)}
                      className="text-teal-500 font-bold underline cursor-pointer"
                    >
                      Calculate Route
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Polyline */}
            {route.length > 0 && (
              <Polyline positions={route} color="#0d9488" weight={6} opacity={0.9} />
            )}
          </MapContainer>

          {/* Bottom Floating Route Info Bar */}
          <AnimatePresence>
            {(routeLoading || routeInfo || routeError) && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                className="absolute bottom-6 left-4 right-4 md:left-6 md:right-6 z-30 max-w-2xl mx-auto"
              >
                <Card glass className="p-4 shadow-2xl border-teal-500/40 relative">
                  <button
                    type="button"
                    onClick={clearRoute}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {routeLoading && (
                    <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Computing Dijkstra shortest path intersection graph...</span>
                    </div>
                  )}

                  {routeError && (
                    <p className="text-xs font-bold text-rose-500">{routeError}</p>
                  )}

                  {routeInfo && selectedHospital && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {selectedHospital.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-bold text-teal-600 dark:text-teal-400">
                              {routeInfo.distanceKm} km
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> ~{routeInfo.durationMin} mins drive
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {selectedHospital.phone && (
                            <a href={`tel:${selectedHospital.phone}`}>
                              <Button size="sm" variant="primary" icon={Phone}>
                                Call
                              </Button>
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" icon={ExternalLink}>
                              Google Maps
                            </Button>
                          </a>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 line-clamp-2">
                        <strong className="text-teal-600 dark:text-teal-400">Dijkstra Path:</strong>{' '}
                        {routeInfo.dijkstraPath.join(' → ')} ({routeInfo.dijkstraDistance} m)
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PublicLayout>
  );
}
