import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeliveryStop, RouteResult } from '@/App';

/**
 * LeafletMap Component
 * Working map implementation using Leaflet
 * - Displays NYC with OpenStreetMap tiles
 * - Shows delivery stops as interactive markers
 * - Draws optimized routes as polylines
 * - Click to add new stops
 */

interface LeafletMapProps {
  stops: DeliveryStop[];
  selectedStopId: string | null;
  routeResults: RouteResult[];
  onAddStop: (stop: DeliveryStop) => void;
  onSelectStop: (id: string | null) => void;
}

// Fix Leaflet icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function LeafletMap({
  stops,
  selectedStopId,
  routeResults,
  onAddStop,
  onSelectStop,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylinesRef = useRef<L.Polyline[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Create map centered on NYC
    map.current = L.map(mapContainer.current).setView([40.7128, -74.006], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add click listener to map
    map.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Reverse geocode using Nominatim (free, no API key needed)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.address?.road || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        onAddStop({
          id: `stop-${Date.now()}`,
          name: `Stop ${stops.length + 1}`,
          address,
          lat,
          lng,
          borough: detectBorough(lat, lng),
        });
      } catch (error) {
        console.error('Geocoding error:', error);
        onAddStop({
          id: `stop-${Date.now()}`,
          name: `Stop ${stops.length + 1}`,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat,
          lng,
          borough: detectBorough(lat, lng),
        });
      }
    });

    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [stops.length, onAddStop]);

  // Update markers when stops change
  useEffect(() => {
    if (!map.current) return;

    // Remove markers for deleted stops
    const stopsIds = new Set(stops.map(s => s.id));
    markersRef.current.forEach((marker, id) => {
      if (!stopsIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    stops.forEach((stop, index) => {
      let marker = markersRef.current.get(stop.id);

      if (!marker) {
        // Create custom HTML for marker with number
        const html = `
          <div style="
            position: relative;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: ${stop.id === selectedStopId ? '#06b6d4' : '#ef4444'};
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${index + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -20],
        });

        marker = L.marker([stop.lat, stop.lng], { icon })
          .addTo(map.current!)
          .bindPopup(`
            <div style="font-size: 12px;">
              <strong>${stop.name}</strong><br/>
              ${stop.address}<br/>
              <span style="color: #06b6d4; font-weight: bold;">${stop.borough}</span>
            </div>
          `);

        marker.on('click', () => onSelectStop(stop.id));
        markersRef.current.set(stop.id, marker);
      } else {
        // Update marker position
        marker.setLatLng([stop.lat, stop.lng]);
      }
    });
  }, [stops, selectedStopId, onSelectStop]);

  // Draw routes
  useEffect(() => {
    if (!map.current) return;

    // Remove old polylines
    polylinesRef.current.forEach(line => line.remove());
    polylinesRef.current = [];

    if (!routeResults.length) return;

    const colors = ['#06b6d4', '#0891b2', '#0ea5e9'];

    routeResults.forEach((result, resultIndex) => {
      const path = result.stops.map(s => [s.lat, s.lng] as [number, number]);

      // Close the loop
      if (path.length > 0) {
        path.push(path[0]);
      }

      const polyline = L.polyline(path, {
        color: colors[resultIndex % colors.length],
        weight: resultIndex === 0 ? 3 : 2,
        opacity: resultIndex === 0 ? 1 : 0.5,
        dashArray: resultIndex === 0 ? '' : '5, 5',
      }).addTo(map.current!);

      polylinesRef.current.push(polyline);
    });

    // Fit map to bounds if there are stops
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng] as [number, number]));
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeResults, stops]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#f0f0f0',
      }}
    />
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
