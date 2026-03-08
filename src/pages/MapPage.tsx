import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Trash2, Shield, Navigation as NavIcon, Plus, MapPin, X, Pencil } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, useMap } from 'react-leaflet';
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

const MapPage = () => {
  const { locations, safeZones, currentUser, addLocation, addSafeZone, updateSafeZone, deleteSafeZone, addAuditEntry } = useApp();
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null);
  const [tracking, setTracking] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(500);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => { setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoError(null); },
      (err) => {
        if (err.code === 1) setGeoError('Location access denied. Please enable location permissions.');
        else setGeoError('Could not get your location. Please try again.');
        // Fallback position
        setCurrentPos({ lat: 40.7128, lng: -74.006 });
      }
    );
  }, []);

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
        // Lost detection
        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 6;
        if (isNight && safeZones.length > 0) {
          let inZone = false;
          let closestZone = safeZones[0];
          let minDist = Infinity;
          for (const z of safeZones) {
            const d = getDistance(loc.lat, loc.lng, z.lat, z.lng);
            if (d < minDist) { minDist = d; closestZone = z; }
            if (d <= z.radius_meters) { inZone = true; break; }
          }
          if (!inZone && minDist > 500 && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Are you lost?', {
              body: `You are ${formatDistance(minDist)} from ${closestZone?.name || 'your safe zone'}. Need help?`,
            });
          }
        }
      },
      () => setGeoError('Lost GPS signal. Trying to reconnect...'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    watchRef.current = id;
    setTracking(true);
  }, [currentUser.id, safeZones, addLocation]);

  const stopTracking = () => {
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
    watchRef.current = null;
    setTracking(false);
  };

  const handleAddSafeZone = () => {
    if (!currentPos) return;
    const name = newZoneName.trim() || 'My Location';
    addSafeZone({
      user_id: currentUser.id, name,
      lat: currentPos.lat, lng: currentPos.lng,
      radius_meters: newZoneRadius, active_hours_start: '00:00', active_hours_end: '23:59',
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'safe_zone_added',
      target_type: 'safe_zone', target_id: '',
      new_value: { name, lat: currentPos.lat, lng: currentPos.lng, radius: newZoneRadius },
    });
    setNewZoneName('');
    setNewZoneRadius(500);
    setShowAddZone(false);
  };

  const handleDeleteZone = (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    deleteSafeZone(id);
    setConfirmDelete(null);
  };

  const recentLocations = locations.slice(-50).map(l => [l.lat, l.lng] as [number, number]);
  const defaultCenter: [number, number] = currentPos ? [currentPos.lat, currentPos.lng] : [40.7128, -74.006];

  return (
    <div className="max-w-lg mx-auto px-4 pt-12 pb-36">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Location & Safety</h1>
        <button
          onClick={tracking ? stopTracking : startTracking}
          className={`flex items-center gap-2 px-4 min-h-[44px] rounded-xl font-medium transition-colors duration-200 ${tracking ? 'bg-destructive/20 text-destructive' : 'bg-mint/20 text-foreground'}`}
        >
          <NavIcon size={16} />
          <span className="text-sm">{tracking ? 'Stop' : 'Track'}</span>
        </button>
      </div>

      {geoError && (
        <GlassCard className="p-3 mb-4 border-destructive/30">
          <p className="text-sm text-destructive">{geoError}</p>
        </GlassCard>
      )}

      {tracking && (
        <GlassCard className="p-3 mb-4 flex items-center gap-2 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-mint animate-pulse" />
          <span className="text-sm">Live tracking · {locations.length} points</span>
          {currentPos && (
            <span className="text-xs text-muted-foreground ml-auto">
              {currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}
            </span>
          )}
        </GlassCard>
      )}

      {/* Map */}
      <GlassCard className="overflow-hidden mb-4" style={{ height: 320 }}>
        <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {currentPos && (
            <>
              <RecenterMap lat={currentPos.lat} lng={currentPos.lng} />
              <Marker position={[currentPos.lat, currentPos.lng]} icon={blueIcon}>
                <Popup>📍 You are here</Popup>
              </Marker>
            </>
          )}
          {safeZones.map(z => (
            <React.Fragment key={z.id}>
              <Circle center={[z.lat, z.lng]} radius={z.radius_meters}
                pathOptions={{ color: 'hsl(150, 55%, 60%)', fillColor: 'hsl(150, 55%, 80%)', fillOpacity: 0.2, weight: 2 }}>
                <Popup>🛡️ {z.name} ({z.radius_meters}m)</Popup>
              </Circle>
              <Marker position={[z.lat, z.lng]} icon={greenIcon}>
                <Popup>🛡️ {z.name}</Popup>
              </Marker>
            </React.Fragment>
          ))}
          {recentLocations.length > 1 && (
            <Polyline positions={recentLocations} pathOptions={{ color: 'hsl(199, 62%, 60%)', weight: 3, opacity: 0.6, dashArray: '8 4' }} />
          )}
        </MapContainer>
      </GlassCard>

      {/* Add Safe Zone */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Shield size={20} /> Safe Zones</h2>
        <button onClick={() => setShowAddZone(!showAddZone)} className="p-3 rounded-full bg-mint/20 hover:bg-mint/30 transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center" aria-label="Add safe zone">
          {showAddZone ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showAddZone && (
        <GlassCard className="p-4 mb-4 animate-scale-in">
          <h3 className="font-semibold mb-3">Add Safe Zone at Current Location</h3>
          <div className="space-y-3">
            <input value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Zone name (e.g. Home, Hospital)" className="input-glass w-full" />
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Radius: {newZoneRadius}m</label>
              <input type="range" min={100} max={5000} step={100} value={newZoneRadius}
                onChange={e => setNewZoneRadius(parseInt(e.target.value))}
                className="w-full accent-mint" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100m</span><span>5km</span>
              </div>
            </div>
            <button onClick={handleAddSafeZone} className="btn-secondary w-full min-h-[48px] flex items-center justify-center gap-2">
              <MapPin size={18} /> Save Safe Zone
            </button>
          </div>
        </GlassCard>
      )}

      {/* Safe Zones List */}
      {safeZones.length === 0 ? (
        <GlassCard className="p-6 text-center">
          <Shield size={32} className="text-mint mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No safe zones yet. Add one to enable lost detection alerts.</p>
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
                        <p className="font-medium">{z.name}</p>
                        <button onClick={() => { setEditingZone(z.id); setZoneName(z.name); }}
                          className="p-1 rounded hover:bg-muted"><Pencil size={12} className="text-muted-foreground" /></button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isInside ? 'bg-mint/20 text-foreground' : 'bg-soft-pink/20 text-foreground'}`}>
                        {isInside ? '✓ Inside zone' : dist !== null ? formatDistance(dist) : 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">{z.radius_meters}m radius</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteZone(z.id)}
                    className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${confirmDelete === z.id ? 'text-destructive bg-destructive/10' : 'text-muted-foreground hover:text-destructive'}`}
                    aria-label="Delete safe zone">
                    {confirmDelete === z.id ? <X size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>

                {/* Radius slider */}
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

// Need React import for React.Fragment
import React from 'react';

export default MapPage;
