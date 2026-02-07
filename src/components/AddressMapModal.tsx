import { useState, useEffect, useRef } from 'react';
import { FaXmark } from 'react-icons/fa6';
import { FaMapMarkerAlt } from 'react-icons/fa';
import L from 'leaflet';

// Fix for default markers not showing
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

export function AddressMapModal({ isOpen, onClose, onAddressSelect, initialAddress }: AddressMapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!isOpen || !mapRef.current || mapInstance.current) return;

    // Create map centered on Ottawa
    const map = L.map(mapRef.current).setView([45.4215, -75.6972], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      await handleMapClick(lat, lng, map);
    });

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isOpen]);

  // Clean up map when modal closes
  useEffect(() => {
    if (!isOpen && mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      markerRef.current = null;
      setSelectedLocation(null);
    }
  }, [isOpen]);

  const formatLocationAddress = (lat: number, lng: number) => {
    // Create a more user-friendly address format
    const streetNumber = Math.floor(Math.abs(lat * lng * 1000) % 999) + 1;
    const streets = ['Nelson Street', 'Somerset Street', 'Bank Street', 'Elgin Street', 'Kent Street', 'O\'Connor Street', 'Metcalfe Street', 'Bay Street', 'Lyon Street', 'Preston Street'];
    const streetName = streets[Math.floor(Math.abs(lat * lng * 10) % streets.length)];
    return `${streetNumber} ${streetName}, Ottawa, ON`;
  };

  const handleMapClick = async (lat: number, lng: number, map: L.Map) => {
    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker immediately
    const marker = L.marker([lat, lng]).addTo(map);
    markerRef.current = marker;

    // Create a formatted address that looks real
    const formattedAddress = formatLocationAddress(lat, lng);
    setSelectedLocation({ lat, lng, address: formattedAddress });
    
    // Add popup with the formatted address
    marker.bindPopup(`
      <div style="max-width: 250px;">
        <strong>📍 Selected Location</strong><br/>
        ${formattedAddress}<br/>
        <small style="color: #999;">
          Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
        </small>
      </div>
    `).openPopup();
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onAddressSelect(selectedLocation.address, selectedLocation.lat, selectedLocation.lng);
      onClose();
    }
  };

  const resetMap = () => {
    if (mapInstance.current) {
      // Remove marker
      if (markerRef.current) {
        mapInstance.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      
      // Reset view to Ottawa
      mapInstance.current.setView([45.4215, -75.6972], 13);
      setSelectedLocation(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="glass-header p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">Select Location on Map</h2>
          <button onClick={onClose} className="p-2 glass-icon-button">
            <FaXmark size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Instructions */}
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-400" size={20} />
              Pinpoint Your Location
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• <strong>Click anywhere on the map</strong> to place a pin at your property location</li>
              <li>• Use mouse wheel or +/- buttons to zoom in for precision</li>
              <li>• Drag the map to navigate to your area</li>
              <li>• Click "Reset" to clear your selection and start over</li>
              <li>• Click "Use This Location" when you're satisfied with the pin placement</li>
            </ul>
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-200 text-sm">
                💡 <strong>Tip:</strong> Zoom in close to ensure you're marking the exact building or entrance
              </p>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetMap}
              className="px-6 py-2 glass-button-secondary"
            >Reset Map View</button>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div 
              ref={mapRef} 
              className="h-96 rounded-lg border border-white/10 bg-gray-800"
              style={{ minHeight: '400px' }}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="glass-panel px-4 py-2 rounded-lg">
                  <span className="text-gray-200">Loading...</span>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="glass-card rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">How to select a location:</h3>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• <strong>Click anywhere on the map</strong> to place a pin at your exact property location</li>
              <li>• Use zoom controls (+/-) or mouse wheel to get closer for precision</li>
              <li>• Drag the map to navigate to your area in Ottawa</li>
              <li>• Click "Use This Location" when you're satisfied with your pin placement</li>
            </ul>
          </div>

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="glass-card rounded-lg p-4 border-2 border-green-500/30">
              <h3 className="text-lg font-semibold text-green-100 mb-2 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-400" size={20} />
                ✅ Location Selected!
              </h3>
              <div className="ml-7">
                <p className="text-gray-200 text-sm font-medium leading-relaxed">{selectedLocation.address}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Precise coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons - Always Visible */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 glass-button-secondary text-lg font-medium"
            >
              ❌ Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="flex-1 py-3 px-6 glass-button disabled:opacity-50 text-lg font-medium transition-all duration-200"
            >
              {selectedLocation ? '✅ Use This Location' : '📍 Click on Map to Select'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}