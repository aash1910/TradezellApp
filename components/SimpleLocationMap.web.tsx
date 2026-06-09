import React, { useEffect, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { createDefaultMarkerIcon, loadLeaflet, regionToZoom, type MapRegion } from '@/utils/loadLeaflet';

type Props = {
  region: MapRegion;
  markerTitle?: string;
  style?: StyleProp<ViewStyle>;
};

export default function SimpleLocationMap({ region, markerTitle, style }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapContainerRef.current || mapRef.current) {
          return;
        }

        const latLng: [number, number] = [region.latitude, region.longitude];
        const map = L.map(mapContainerRef.current, {
          center: latLng,
          zoom: regionToZoom(region.latitudeDelta),
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker(latLng, { icon: createDefaultMarkerIcon(L) }).addTo(map);
        if (markerTitle) {
          marker.bindPopup(markerTitle);
        }

        mapRef.current = map;
      } catch (error) {
        console.warn('Failed to initialize simple map on web:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markerTitle, region.latitude, region.latitudeDelta, region.longitude]);

  return (
    <View style={[{ flex: 1, backgroundColor: '#f8fbf9' }, style]}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
