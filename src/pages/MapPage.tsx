import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Trash2, Shield, Navigation as NavIcon, Plus, MapPin, X, Pencil, Home, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 14); }, [lat, lng, map]);
  return null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m away`;
  return `${(meters / 1000).toFixed(1)}km away`;
}

function detectCircularMovement(points: Array<{ lat: number; lng: number; at: number }>): boolean {
  if (points.length < 8) return false;

  const centroid = points.reduce(
    (acc, point) => ({ lat: acc.lat + point.lat / points.length, lng: acc.lng + point.lng / points.length }),
    { lat: 0, lng: 0 }
  );

  const radii = points.map(p => getDistance(p.lat, p.lng, centroid.lat, centroid.lng));
  const avgRadius = radii.reduce((sum, radius) => sum + radius, 0) / radii.length;
  if (avgRadius < 20 || avgRadius > 180) return false;

  const variance = radii.reduce((sum, radius) => sum + (radius - avgRadius) ** 2, 0) / radii.length;
  const stdDev = Math.sqrt(variance);

  let pathLength = 0;
  for (let i = 1; i < points.length; i++) {
    pathLength += getDistance(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
  }

  const netDistance = getDistance(
    points[0].lat,
    points[0].lng,
    points[points.length - 1].lat,
    points[points.length - 1].lng
  );

  const consistentRadius = stdDev / avgRadius < 0.35;
  const loopingPattern = pathLength > avgRadius * 4 && netDistance < avgRadius * 1.8;

  return consistentRadius && loopingPattern;
}

// Component to handle map clicks for adding pins
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LostBanner = ({
  closestZone,
  distance,
  reason,
  onSOS,
  onDirections,
  onDismiss,
}: {
  closestZone: string;
  distance: number;
  reason: string;
  onSOS: () => void;
  onDirections: () => void;
  onDismiss: () => void;
}) => (
  <div className="fixed top-0 left-0 right-0 z-[80] animate-fade-in">
    <div className="max-w-lg mx-auto px-4 pt-14">
      <div className="bg-destructive/95 backdrop-blur-sm text-destructive-foreground p-4" style={{ borderRadius: 'var(--radius-md)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Are you lost?</p>
            <p className="text-xs opacity-90">You are {formatDistance(distance)} from {closestZone}</p>
            <p className="text-xs opacity-80 mt-1">Detected: {reason}</p>
          </div>
          <button onClick={onDismiss} className="text-destructive-foreground/80 hover:text-destructive-foreground min-h-[36px] px-2" aria-label="Dismiss">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={onSOS}
            className="px-3 py-2 bg-destructive-foreground text-destructive font-bold rounded-xl text-sm min-h-[44px] active:scale-95 transition-transform"
          >
            Press SOS
          </button>
          <button
            onClick={onDirections}
            className="px-3 py-2 bg-card/90 text-foreground font-semibold rounded-xl text-sm min-h-[44px] active:scale-95 transition-transform"
          >
            Show Way Home
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MapPage = () => {
  const { locations, safeZones, currentUser, addLocation, addSafeZone, updateSafeZone, deleteSafeZone, addAuditEntry, addSOSEvent, contacts } = useApp();
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [showAddZone, setShowAddZone] = useState(false);
  const [addPinMode, setAddPinMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(500);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isLost, setIsLost] = useState(false);
  const [lostInfo, setLostInfo] = useState<{ zone: string; distance: number; reason: string } | null>(null);
  const [showNavHome, setShowNavHome] = useState(false);
  const watchRef = useRef<number | null>(null);
  const lostTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movementHistoryRef = useRef<Array<{ lat: number; lng: number; at: number }>>([]);
  const outsideHomeSinceRef = useRef<number | null>(null);
  const lostSnoozedUntilRef = useRef<number>(0);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoError(null); },
      (err) => {
        if (err.code === 1) setGeoError('Location access denied. Please enable location permissions.');
        else setGeoError('Could not get your location. Please try again.');
        setCurrentPos({ lat: 40.7128, lng: -74.006 });
      }
    );
  }, []);

  // Check if user is outside all safe zones
  const checkLostStatus = useCallback((loc: { lat: number; lng: number }) => {
    if (safeZones.length === 0) return;

    let inAnyZone = false;
    let closestZone = safeZones[0];
    let minDist = Infinity;

    for (const z of safeZones) {
      const d = getDistance(loc.lat, loc.lng, z.lat, z.lng);
      if (d < minDist) { minDist = d; closestZone = z; }
      if (d <= z.radius_meters) { inAnyZone = true; }
    }

    if (!inAnyZone && minDist > 200) {
      setIsLost(true);
      setLostInfo({ zone: closestZone.name, distance: minDist });

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Are you lost?', {
          body: `You are ${formatDistance(minDist)} from ${closestZone.name}. Tap to get help.`,
          tag: 'lost-detection',
        });
      }
    } else {
      setIsLost(false);
      setLostInfo(null);
      setShowNavHome(false);
    }
  }, [safeZones]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported'); return; }
    if ('Notification' in window) Notification.requestPermission();
    const id = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(loc);
        setGeoError(null);
        addLocation({
          user_id: currentUser.id, lat: loc.lat, lng: loc.lng,
          accuracy: pos.coords.accuracy, timestamp: new Date().toISOString(),
        });
        checkLostStatus(loc);
      },
      () => setGeoError('Lost GPS signal. Trying to reconnect...'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    watchRef.current = id;
    setTracking(true);
  }, [currentUser.id, addLocation, checkLostStatus]);

  const stopTracking = () => {
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
    watchRef.current = null;
    setTracking(false);
    setIsLost(false);
    setLostInfo(null);
  };

  useEffect(() => {
    return () => {
      if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
      if (lostTimerRef.current) clearTimeout(lostTimerRef.current);
    };
  }, []);

  const handleShowDirections = () => {
    setShowNavHome(true);
    setIsLost(false);
  };

  const handleSOS = () => {
    if (!currentPos) return;
    addSOSEvent({
      user_id: currentUser.id,
      type: 'lost',
      location_lat: currentPos.lat,
      location_lng: currentPos.lng,
      contacts_notified: contacts.filter(c => c.is_emergency).map(c => c.name),
      timestamp: new Date().toISOString(),
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'sos_triggered',
      target_type: 'sos_event', target_id: '',
      new_value: { type: 'lost', lat: currentPos.lat, lng: currentPos.lng },
    });
    setShowNavHome(true);
    setIsLost(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (addPinMode) {
      setPendingPin({ lat, lng });
    }
  };

  const handleAddSafeZone = () => {
    const pos = pendingPin || currentPos;
    if (!pos) return;
    const name = newZoneName.trim() || 'Safe Zone';
    addSafeZone({
      user_id: currentUser.id, name,
      lat: pos.lat, lng: pos.lng,
      radius_meters: newZoneRadius, active_hours_start: '00:00', active_hours_end: '23:59',
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'safe_zone_added',
      target_type: 'safe_zone', target_id: '',
      new_value: { name, lat: pos.lat, lng: pos.lng, radius: newZoneRadius },
    });
    setNewZoneName('');
    setNewZoneRadius(500);
    setShowAddZone(false);
    setAddPinMode(false);
    setPendingPin(null);
  };

  const handleDeleteZone = (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    deleteSafeZone(id);
    setConfirmDelete(null);
  };

  // Find "Home" zone for navigation
  const homeZone = safeZones.find(z => z.name.toLowerCase().includes('home')) || safeZones[0];

  const recentLocations = locations.slice(-50).map(l => [l.lat, l.lng] as [number, number]);
  const defaultCenter: [number, number] = currentPos ? [currentPos.lat, currentPos.lng] : [40.7128, -74.006];

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      {/* Lost detection banner */}
      {isLost && lostInfo && (
        <LostBanner closestZone={lostInfo.zone} distance={lostInfo.distance} onSOS={handleSOS} />
      )}

      {/* Navigate home overlay */}
      {showNavHome && homeZone && currentPos && (
        <GlassCard className="mb-4 p-4 border-2 border-mint/40 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-mint/20 flex items-center justify-center">
              <Home size={20} className="text-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Finding your way to {homeZone.name}</p>
              <p className="text-xs text-muted-foreground">{formatDistance(getDistance(currentPos.lat, currentPos.lng, homeZone.lat, homeZone.lng))}</p>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&origin=${currentPos.lat},${currentPos.lng}&destination=${homeZone.lat},${homeZone.lng}&travelmode=walking`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full flex items-center justify-center gap-2 min-h-[48px]"
          >
            <NavIcon size={18} />
            Open Walking Directions
          </a>
          <button onClick={() => setShowNavHome(false)} className="w-full text-sm text-muted-foreground mt-2 min-h-[44px]">
            Dismiss
          </button>
        </GlassCard>
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Location</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setAddPinMode(!addPinMode); setPendingPin(null); }}
            className={`flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl font-medium text-sm transition-colors duration-200 active:scale-95 ${
              addPinMode ? 'bg-soft-pink/30 text-foreground' : 'bg-soft-pink/10 text-muted-foreground'
            }`}
          >
            <MapPin size={16} />
            Pin
          </button>
          <button
            onClick={tracking ? stopTracking : startTracking}
            className={`flex items-center gap-1.5 px-3 min-h-[44px] rounded-xl font-medium text-sm transition-colors duration-200 active:scale-95 ${
              tracking ? 'bg-destructive/20 text-destructive' : 'bg-mint/20 text-foreground'
            }`}
          >
            <NavIcon size={16} />
            {tracking ? 'Stop' : 'Track'}
          </button>
        </div>
      </div>

      {geoError && (
        <GlassCard className="p-3 mb-4 border-destructive/30">
          <p className="text-sm text-destructive">{geoError}</p>
        </GlassCard>
      )}

      {addPinMode && (
        <GlassCard className="p-3 mb-3 flex items-center gap-2 bg-soft-pink/10 animate-fade-in">
          <MapPin size={16} className="text-soft-pink" />
          <span className="text-sm text-foreground">
            {pendingPin ? 'Pin placed! Name it below.' : 'Tap the map to place a safe zone pin.'}
          </span>
        </GlassCard>
      )}

      {tracking && (
        <GlassCard className="p-3 mb-3 flex items-center gap-2 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-mint animate-pulse" />
          <span className="text-sm text-foreground">Live tracking</span>
          {currentPos && safeZones.length > 0 && (() => {
            let minDist = Infinity;
            let closest = safeZones[0];
            let inside = false;
            for (const z of safeZones) {
              const d = getDistance(currentPos.lat, currentPos.lng, z.lat, z.lng);
              if (d < minDist) { minDist = d; closest = z; }
              if (d <= z.radius_meters) inside = true;
            }
            return (
              <span className={`text-xs ml-auto px-2 py-0.5 rounded-full ${inside ? 'bg-mint/20' : 'bg-soft-pink/20'}`}>
                {inside ? `Inside ${closest.name}` : `${formatDistance(minDist)} from ${closest.name}`}
              </span>
            );
          })()}
        </GlassCard>
      )}

      {/* Map */}
      <GlassCard className="overflow-hidden mb-4" style={{ height: 340 }}>
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {currentPos && (
            <>
              <RecenterMap lat={currentPos.lat} lng={currentPos.lng} />
              <Marker position={[currentPos.lat, currentPos.lng]} icon={blueIcon}>
                <Popup>You are here</Popup>
              </Marker>
            </>
          )}
          {pendingPin && (
            <Marker position={[pendingPin.lat, pendingPin.lng]}>
              <Popup>New safe zone pin</Popup>
            </Marker>
          )}
          {safeZones.map(z => (
            <React.Fragment key={z.id}>
              <Circle center={[z.lat, z.lng]} radius={z.radius_meters}
                pathOptions={{ color: 'hsl(150, 55%, 60%)', fillColor: 'hsl(150, 55%, 80%)', fillOpacity: 0.2, weight: 2 }}>
                <Popup>{z.name} ({z.radius_meters}m)</Popup>
              </Circle>
              <Marker position={[z.lat, z.lng]} icon={greenIcon}>
                <Popup>{z.name}</Popup>
              </Marker>
            </React.Fragment>
          ))}
          {recentLocations.length > 1 && (
            <Polyline positions={recentLocations} pathOptions={{ color: 'hsl(199, 62%, 60%)', weight: 3, opacity: 0.6, dashArray: '8 4' }} />
          )}
        </MapContainer>
      </GlassCard>

      {/* Add zone form - shown when pin is placed or manual add */}
      {(pendingPin || showAddZone) && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <h3 className="font-semibold mb-3 text-foreground">
            {pendingPin ? 'Name this safe zone' : 'Add Safe Zone at Current Location'}
          </h3>
          <div className="space-y-3">
            <input value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Zone name (e.g. Home, Park, Hospital)" className="input-glass w-full" />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Radius: {newZoneRadius}m</label>
              <input type="range" min={100} max={5000} step={100} value={newZoneRadius}
                onChange={e => setNewZoneRadius(parseInt(e.target.value))}
                className="w-full accent-mint" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100m</span><span>5km</span>
              </div>
            </div>
            <button onClick={handleAddSafeZone} className="btn-secondary w-full min-h-[48px] flex items-center justify-center gap-2 active:scale-95">
              <Shield size={18} /> Save Safe Zone
            </button>
            <button onClick={() => { setShowAddZone(false); setAddPinMode(false); setPendingPin(null); }} className="w-full text-sm text-muted-foreground min-h-[44px]">
              Cancel
            </button>
          </div>
        </GlassCard>
      )}

      {/* Safe Zones header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Shield size={20} /> Safe Zones</h2>
        <button onClick={() => { setShowAddZone(!showAddZone); setAddPinMode(false); setPendingPin(null); }} className="p-3 rounded-full bg-mint/20 hover:bg-mint/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-95" aria-label="Add safe zone">
          {showAddZone ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {/* Safe Zones List */}
      {safeZones.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-mint/15 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-mint" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No safe zones yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Add safe zones like Home or Hospital. You will be alerted when you leave them.</p>
          <button onClick={() => setAddPinMode(true)} className="btn-secondary flex items-center gap-2 mx-auto active:scale-95">
            <MapPin size={16} /> Pin on Map
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {safeZones.map(z => {
            const dist = currentPos ? getDistance(currentPos.lat, currentPos.lng, z.lat, z.lng) : null;
            const isInside = dist !== null && dist <= z.radius_meters;

            return (
              <GlassCard key={z.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    {editingZone === z.id ? (
                      <div className="flex gap-2">
                        <input value={zoneName} onChange={e => setZoneName(e.target.value)}
                          className="input-glass text-sm py-1 px-2 flex-1" autoFocus />
                        <button onClick={() => { updateSafeZone(z.id, { name: zoneName }); setEditingZone(null); }}
                          className="text-sm text-mint font-medium min-h-[36px] px-3">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{z.name}</p>
                        <button onClick={() => { setEditingZone(z.id); setZoneName(z.name); }}
                          className="p-1 rounded hover:bg-muted"><Pencil size={12} className="text-muted-foreground" /></button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isInside ? 'bg-mint/20 text-foreground' : 'bg-soft-pink/20 text-foreground'}`}>
                        {isInside ? 'Inside zone' : dist !== null ? formatDistance(dist) : 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">{z.radius_meters}m radius</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteZone(z.id)}
                    className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 ${confirmDelete === z.id ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'}`}
                    aria-label="Delete safe zone">
                    {confirmDelete === z.id ? <X size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>
                <input type="range" min={100} max={5000} step={100} value={z.radius_meters}
                  onChange={e => updateSafeZone(z.id, { radius_meters: parseInt(e.target.value) })}
                  className="w-full accent-mint" aria-label="Adjust radius" />
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapPage;
