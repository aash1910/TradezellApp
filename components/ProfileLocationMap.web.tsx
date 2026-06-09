import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { createDefaultMarkerIcon, loadLeaflet, type MapRegion } from '@/utils/loadLeaflet';

type MarkerCoord = {
  latitude: number;
  longitude: number;
} | null;

type Props = {
  region: MapRegion;
  marker: MarkerCoord;
  onPress: (e: any) => void;
};

export default function ProfileLocationMap({ region, marker, onPress }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const markerIconRef = useRef<any>(null);
  const onPressRef = useRef(onPress);

  const selectedCoordinate = useMemo(
    () => marker ?? { latitude: region.latitude, longitude: region.longitude },
    [marker, region.latitude, region.longitude]
  );

  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapContainerRef.current || mapRef.current) {
          return;
        }

        const initialLatLng: [number, number] = [selectedCoordinate.latitude, selectedCoordinate.longitude];
        const map = L.map(mapContainerRef.current, {
          center: initialLatLng,
          zoom: 16,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        markerIconRef.current = createDefaultMarkerIcon(L);
        markerRef.current = L.marker(initialLatLng, { icon: markerIconRef.current }).addTo(map);

        map.on('click', (event: any) => {
          const coordinate = {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          };

          if (markerRef.current) {
            markerRef.current.setLatLng([coordinate.latitude, coordinate.longitude]);
          } else {
            markerRef.current = L.marker([coordinate.latitude, coordinate.longitude], {
              icon: markerIconRef.current,
            }).addTo(map);
          }

          onPressRef.current({ nativeEvent: { coordinate } });
        });

        mapRef.current = map;
      } catch (error) {
        console.warn('Failed to initialize profile map on web:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      markerIconRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.L) {
      return;
    }

    const latLng: [number, number] = [selectedCoordinate.latitude, selectedCoordinate.longitude];
    mapRef.current.setView(latLng, mapRef.current.getZoom());

    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
      if (markerIconRef.current) {
        markerRef.current.setIcon(markerIconRef.current);
      }
    } else if (marker) {
      markerRef.current = window.L.marker(latLng, { icon: markerIconRef.current }).addTo(mapRef.current);
    }
  }, [selectedCoordinate.latitude, selectedCoordinate.longitude, marker]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fbf9' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
