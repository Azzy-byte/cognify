import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/store/AppContext';
import GlassCard from '@/components/GlassCard';
import { Trash2, Shield, Navigation as NavIcon } from 'lucide-react';
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

const MapPage = () => {
  const { locations, safeZones, currentUser, addLocation, addSafeZone, updateSafeZone, deleteSafeZone, addAuditEntry } = useApp();
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number }>({ lat: 40.7128, lng: -74.006 });
  const [tracking, setTracking] = useState(false);
  const [editingZone, setEditingZone] = useState<string | null>(null);
  const [zoneName, setZoneName] = useState('');
  const watchRef = useRef<number | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => setCurrentPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPos(loc);
        addLocation({
          user_id: currentUser.id, lat: loc.lat, lng: loc.lng,
          accuracy: pos.coords.accuracy, timestamp: new Date().toISOString(),
        });
        const hour = new Date().getHours();
        const isNight = hour >= 20 || hour < 6;
        if (isNight) {
          const inZone = safeZones.some(z => getDistance(loc.lat, loc.lng, z.lat, z.lng) <= z.radius_meters);
          if (!inZone && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Are you lost?', { body: "You're outside your safe zones at night. Tap for help." });
          }
        }
      },
      undefined,
      { enableHighAccuracy: true }
    );
    watchRef.current = id;
    setTracking(true);
  }, [currentUser.id, safeZones, addLocation]);

  const stopTracking = () => {
    if (watchRef.current !== null) navigator.geolocation?.clearWatch(watchRef.current);
    setTracking(false);
  };

  const addCurrentAsSafe = () => {
    if (!currentPos) return;
    addSafeZone({
      user_id: currentUser.id, name: 'My Location',
      lat: currentPos.lat, lng: currentPos.lng,
      radius_meters: 500, active_hours_start: '00:00', active_hours_end: '23:59',
    });
    addAuditEntry({
      timestamp: new Date().toISOString(),
      actor_id: currentUser.id,
      actor_name: `${currentUser.name} (${currentUser.role})`,
      action_type: 'safe_zone_added',
      target_type: 'safe_zone', target_id: '',
      new_value: { name: 'My Location', lat: currentPos.lat, lng: currentPos.lng },
    });
  };

  const recentLocations = locations.slice(-50).map(l => [l.lat, l.lng] as [number, number]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-36">
      <h1 className="text-2xl font-bold mb-4">Location & Safe Zones</h1>

      {currentPos && (
        <GlassCard className="overflow-hidden mb-4" style={{ height: 350 }}>
          <MapContainer center={[currentPos.lat, currentPos.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={currentPos.lat} lng={currentPos.lng} />
            <Marker position={[currentPos.lat, currentPos.lng]} icon={blueIcon}>
              <Popup>Current Location</Popup>
            </Marker>
            {safeZones.map(z => (
              <Circle key={z.id} center={[z.lat, z.lng]} radius={z.radius_meters}
                pathOptions={{ color: '#B8F5D8', fillColor: '#B8F5D8', fillOpacity: 0.2 }}>
                <Popup>{z.name}</Popup>
              </Circle>
            ))}
            {recentLocations.length > 1 && (
              <Polyline positions={recentLocations} pathOptions={{ color: '#B8D8F5', weight: 3, opacity: 0.7 }} />
            )}
          </MapContainer>
        </GlassCard>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={addCurrentAsSafe} className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[48px]">
          <Shield size={18} /> Set Current Area as Safe
        </button>
        <button onClick={tracking ? stopTracking : startTracking}
          className={`rounded-full min-h-[48px] min-w-[48px] px-4 font-semibold transition-colors duration-200 flex items-center justify-center ${tracking ? 'bg-destructive/20 text-destructive' : 'bg-mint/20 text-mint'}`}
          aria-label={tracking ? 'Stop tracking' : 'Start tracking'}
        >
          <NavIcon size={18} />
        </button>
      </div>

      {tracking && (
        <GlassCard className="p-3 mb-4 flex items-center gap-2 animate-fade-in">
          <div className="w-3 h-3 rounded-full bg-mint animate-pulse" />
          <span className="text-sm">Tracking active · {locations.length} points recorded</span>
        </GlassCard>
      )}

      <h2 className="text-lg font-semibold mb-3">Safe Zones</h2>
      <div className="space-y-2">
        {safeZones.map(z => (
          <GlassCard key={z.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                {editingZone === z.id ? (
                  <input value={zoneName} onChange={e => setZoneName(e.target.value)}
                    onBlur={() => { updateSafeZone(z.id, { name: zoneName }); setEditingZone(null); }}
                    className="input-glass text-sm py-1 px-2" autoFocus />
                ) : (
                  <p className="font-medium cursor-pointer" onClick={() => { setEditingZone(z.id); setZoneName(z.name); }}>
                    {z.name}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">{z.radius_meters}m radius</p>
              </div>
              <button onClick={() => deleteSafeZone(z.id)} className="p-2 text-destructive/60 hover:text-destructive min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Delete safe zone">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mt-2">
              <input type="range" min={100} max={5000} step={100} value={z.radius_meters}
                onChange={e => updateSafeZone(z.id, { radius_meters: parseInt(e.target.value) })}
                className="w-full accent-mint" aria-label="Adjust radius" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100m</span><span>5000m</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default MapPage;
