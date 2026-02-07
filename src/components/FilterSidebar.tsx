import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { ListingFilters } from '../types/database';

interface FilterSidebarProps {
  onFilterChange: (filters: ListingFilters) => void;
}

export function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<ListingFilters>({});
  const [addressQuery, setAddressQuery] = useState('');
  const [distanceError, setDistanceError] = useState('');
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    displayName: string;
    lat: number;
    lng: number;
  }>>([]);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const expandedMapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const expandedMapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const expandedMarkerRef = useRef<L.Marker | null>(null);

  const handleFilterChange = (key: keyof ListingFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRentalTypeToggle = (type: string) => {
    const currentTypes = filters.rentalType || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    handleFilterChange('rentalType', newTypes);
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter((a) => a !== amenity)
      : [...currentAmenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  useEffect(() => {
    if (filters.targetAddress && filters.targetAddress !== addressQuery) {
      setAddressQuery(filters.targetAddress);
    }
  }, [filters.targetAddress, addressQuery]);

  const updateTargetLocation = (lat: number, lng: number) => {
    handleFilterChange('targetLat', lat);
    handleFilterChange('targetLng', lng);
    if (!filters.radiusKm) {
      handleFilterChange('radiusKm', 5);
    }
  };

  const createPinIcon = () => L.divIcon({
    className: 'map-pin-icon',
    html: `
      <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M15 0C7.2 0 1 6.1 1 13.8c0 8.7 12.4 26.4 13.9 28.6.3.4.9.4 1.2 0 1.5-2.2 13.9-19.9 13.9-28.6C29 6.1 22.8 0 15 0z" fill="#8f001a"/>
        <circle cx="15" cy="14" r="5" fill="#f6f4f3"/>
      </svg>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  });

  const applySearchResult = (result: { displayName: string; lat: number; lng: number }) => {
    handleFilterChange('targetAddress', result.displayName);
    setAddressQuery(result.displayName);
    updateTargetLocation(result.lat, result.lng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([result.lat, result.lng], 13);
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([result.lat, result.lng]);
    }
    if (expandedMapInstanceRef.current) {
      expandedMapInstanceRef.current.setView([result.lat, result.lng], 13);
    }
    if (expandedMarkerRef.current) {
      expandedMarkerRef.current.setLatLng([result.lat, result.lng]);
    }
  };

  const geocodeAddress = async () => {
    if (!addressQuery.trim()) return;
    setDistanceError('');
    setSearchResults([]);
    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        q: addressQuery.trim(),
        format: 'jsonv2',
        addressdetails: '1',
        limit: '5',
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      const results = await response.json();
      if (!results?.length) {
        setDistanceError('No results found for that address.');
        return;
      }
      const formattedResults = results.map((result: { display_name: string; lat: string; lon: string }) => ({
        displayName: result.display_name,
        lat: Number(result.lat),
        lng: Number(result.lon),
      }));
      setSearchResults(formattedResults);
      if (formattedResults.length === 1) {
        applySearchResult(formattedResults[0]);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      setDistanceError('Unable to geocode that address right now.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialLat = filters.targetLat ?? 45.4215;
    const initialLng = filters.targetLng ?? -75.6972;

    const pinIcon = createPinIcon();

    const map = L.map(mapRef.current, {
      center: [initialLat, initialLng],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: pinIcon,
    }).addTo(map);
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      updateTargetLocation(position.lat, position.lng);
    });

    map.on('click', (event) => {
      const position = event.latlng;
      marker.setLatLng(position);
      updateTargetLocation(position.lat, position.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isMapExpanded || !expandedMapRef.current || expandedMapInstanceRef.current) return;

    const initialLat = filters.targetLat ?? 45.4215;
    const initialLng = filters.targetLng ?? -75.6972;
    const pinIcon = createPinIcon();

    const expandedMap = L.map(expandedMapRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(expandedMap);

    const expandedMarker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: pinIcon,
    }).addTo(expandedMap);
    expandedMarker.on('dragend', () => {
      const position = expandedMarker.getLatLng();
      updateTargetLocation(position.lat, position.lng);
    });
    expandedMap.on('click', (event) => {
      const position = event.latlng;
      expandedMarker.setLatLng(position);
      updateTargetLocation(position.lat, position.lng);
    });

    expandedMapInstanceRef.current = expandedMap;
    expandedMarkerRef.current = expandedMarker;

    setTimeout(() => {
      expandedMap.invalidateSize();
    }, 0);

    return () => {
      expandedMap.remove();
      expandedMapInstanceRef.current = null;
      expandedMarkerRef.current = null;
    };
  }, [isMapExpanded, filters.targetLat, filters.targetLng]);

  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    if (filters.targetLat === undefined || filters.targetLng === undefined) return;
    markerRef.current.setLatLng([filters.targetLat, filters.targetLng]);
  }, [filters.targetLat, filters.targetLng]);

  useEffect(() => {
    if (!expandedMapInstanceRef.current || !expandedMarkerRef.current) return;
    if (filters.targetLat === undefined || filters.targetLng === undefined) return;
    expandedMarkerRef.current.setLatLng([filters.targetLat, filters.targetLng]);
  }, [filters.targetLat, filters.targetLng]);

  return (
    <div className="glass-card rounded-lg p-6 h-fit">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Filters</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Price Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) =>
                handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)
              }
              className="glass-input text-sm px-3 py-2"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) =>
                handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)
              }
              className="glass-input text-sm px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bedrooms
          </label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) =>
              handleFilterChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)
            }
            className="glass-input text-sm px-3 py-2"
          >
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Bathrooms
          </label>
          <select
            value={filters.bathrooms || ''}
            onChange={(e) =>
              handleFilterChange('bathrooms', e.target.value ? Number(e.target.value) : undefined)
            }
            className="glass-input text-sm px-3 py-2"
          >
            <option value="">Any</option>
            {[1, 1.5, 2, 2.5, 3].map((num) => (
              <option key={num} value={num}>
                {num}+
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === undefined}
                onChange={() => handleFilterChange('isOnCampus', undefined)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">All</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === true}
                onChange={() => handleFilterChange('isOnCampus', true)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">On Campus</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="location"
                checked={filters.isOnCampus === false}
                onChange={() => handleFilterChange('isOnCampus', false)}
                className="mr-2 accent-blue-600"
              />
              <span className="text-sm text-gray-300">Off Campus</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender Preference
          </label>
          <select
            value={filters.genderPreference || 'any'}
            onChange={(e) => handleFilterChange('genderPreference', e.target.value as any)}
            className="glass-input text-sm px-3 py-2"
          >
            <option value="any">Any</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rental Type
          </label>
          <div className="space-y-2">
            {['apartment', 'house', 'room', 'basement', 'floor'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(filters.rentalType || []).includes(type)}
                  onChange={() => handleRentalTypeToggle(type)}
                  className="mr-2 accent-blue-600"
                />
                <span className="text-sm text-gray-300 capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amenities
          </label>
          <div className="space-y-2">
            {['Parking', 'Laundry', 'Wi-Fi', 'Gym', 'Pool', 'Furnished', 'Pet Friendly'].map(
              (amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.amenities || []).includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="mr-2 accent-blue-600"
                  />
                  <span className="text-sm text-gray-300">{amenity}</span>
                </label>
              )
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Distance Filter
            </label>
            <button
              type="button"
              onClick={() => {
                handleFilterChange('targetLat', undefined);
                handleFilterChange('targetLng', undefined);
                handleFilterChange('radiusKm', undefined);
                handleFilterChange('targetAddress', undefined);
                setAddressQuery('');
                setDistanceError('');
                setSearchResults([]);
              }}
              className="text-xs text-gray-400 hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  geocodeAddress();
                }
              }}
              className="glass-input text-sm px-3 py-2"
              placeholder="Search address or landmark"
            />
            <button
              type="button"
              onClick={geocodeAddress}
              className="px-4 glass-button"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {distanceError && (
            <p className="text-xs text-red-200 mt-2">{distanceError}</p>
          )}
          {!distanceError && searchResults.length > 0 && (
            <div className="mt-2 space-y-2">
              {searchResults.map((result) => (
                <button
                  key={`${result.lat}-${result.lng}`}
                  type="button"
                  onClick={() => applySearchResult(result)}
                  className="w-full text-left text-xs text-gray-300 hover:text-gray-100 border border-white/10 rounded-lg px-3 py-2"
                >
                  {result.displayName}
                </button>
              ))}
            </div>
          )}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Radius (km)</span>
              <span>{filters.radiusKm ?? 5} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={filters.radiusKm ?? 5}
              onChange={(e) => handleFilterChange('radiusKm', Number(e.target.value))}
              className="w-full mt-2 accent-blue-600"
            />
            <input
              type="number"
              min="1"
              max="200"
              value={filters.radiusKm ?? 5}
              onChange={(e) => handleFilterChange('radiusKm', Number(e.target.value))}
              className="glass-input text-sm px-3 py-2 mt-2"
            />
          </div>
          {!isMapExpanded && (
            <div className="mt-3">
              <div ref={mapRef} className="h-56 w-full rounded-lg overflow-hidden border border-white/10" />
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Drop or drag the pin to set the center of your search.
                </p>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(true)}
                  className="text-xs text-gray-300 hover:text-gray-100"
                >
                  Expand map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {isMapExpanded &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-black/80 p-6">
            <div className="glass-panel rounded-2xl h-full w-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h4 className="text-lg font-semibold text-gray-100">Pick a location</h4>
                <button
                  type="button"
                  onClick={() => setIsMapExpanded(false)}
                  className="glass-icon-button h-10 w-10 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-4">
                <div ref={expandedMapRef} className="h-full w-full rounded-xl overflow-hidden border border-white/10" />
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
