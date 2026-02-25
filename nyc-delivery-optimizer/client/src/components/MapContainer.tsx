import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LeafletMap from './LeafletMap';
import type { DeliveryStop, RouteResult } from '@/App';

/**
 * MapContainer Component
 * Design: Modern Enterprise SaaS
 * - Live Leaflet map with real-time route visualization
 * - Click to add stops, drag to reposition
 * - Gradient-colored polylines for routes
 * - Address search
 * - Borough highlighting
 */

interface MapContainerProps {
  stops: DeliveryStop[];
  selectedStopId: string | null;
  routeResults: RouteResult[];
  onAddStop: (stop: DeliveryStop) => void;
  onSelectStop: (id: string | null) => void;
  onUpdateStop: (id: string, updates: Partial<DeliveryStop>) => void;
  onMapReady: (map: any) => void;
}

const BOROUGH_COLORS: Record<string, string> = {
  Manhattan: '#1e293b',
  Brooklyn: '#0891b2',
  Queens: '#10b981',
  Bronx: '#f59e0b',
  'Staten Island': '#8b5cf6',
};

export default function MapContainer({
  stops,
  selectedStopId,
  routeResults,
  onAddStop,
  onSelectStop,
  onUpdateStop,
  onMapReady,
}: MapContainerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      // Use OpenStreetMap Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', New York, NY'
        )}&limit=1`
      );
      const results = await response.json();

      if (results.length > 0) {
        const place = results[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        const borough = detectBorough(lat, lng);

        onAddStop({
          id: `stop-${Date.now()}`,
          name: place.name || 'Search Result',
          address: place.display_name || '',
          lat,
          lng,
          borough,
        });

        setSearchQuery('');
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2 max-w-sm">
        <Input
          type="text"
          placeholder="Search address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(searchQuery);
            }
          }}
          className="bg-white shadow-md border-slate-200"
        />
        <Button
          size="sm"
          onClick={() => handleSearch(searchQuery)}
          className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats Card */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <div className="text-sm font-semibold text-slate-900">
          {stops.length} {stops.length === 1 ? 'Stop' : 'Stops'}
        </div>
        {routeResults[0] && (
          <div className="text-xs text-slate-600 mt-1">
            <div>Distance: {routeResults[0].distance.toFixed(1)} km</div>
            <div>Time: {Math.round(routeResults[0].duration)} min</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h4 className="text-xs font-semibold text-slate-900 mb-2">Boroughs</h4>
        <div className="space-y-1">
          {Object.entries(BOROUGH_COLORS).map(([borough, color]) => (
            <div key={borough} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-slate-700">{borough}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-md p-3 max-w-xs text-xs text-slate-600">
        <p className="font-semibold text-slate-900 mb-1">💡 Tips:</p>
        <ul className="space-y-0.5">
          <li>• Click map to add stops</li>
          <li>• Search for addresses</li>
          <li>• Numbered markers show route order</li>
          <li>• Colored lines show different routes</li>
        </ul>
      </div>

      {/* Leaflet Map */}
      <LeafletMap
        stops={stops}
        selectedStopId={selectedStopId}
        routeResults={routeResults}
        onAddStop={onAddStop}
        onSelectStop={onSelectStop}
      />
    </div>
  );
}

function detectBorough(lat: number, lng: number): string {
  // NYC borough boundaries (approximate)
  if (lat > 40.8 && lng < -73.7) return 'Bronx';
  if (lat < 40.6 && lng < -74.0) return 'Staten Island';
  if (lat < 40.65 && lng > -73.95) return 'Brooklyn';
  if (lat > 40.75 && lng > -73.8) return 'Queens';
  return 'Manhattan';
}
