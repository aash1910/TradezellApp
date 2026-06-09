import React, { useEffect, useMemo, useRef } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import {
  createDefaultMarkerIcon,
  loadLeaflet,
  mapCenterToRegion,
  regionToZoom,
  type MapRegion,
} from '@/utils/loadLeaflet';

type MarkerCoord = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: MapRegion;
  marker: MarkerCoord | null;
  onPress: (e: any) => void;
  onRegionChangeComplete?: (region: MapRegion) => void;
  style?: StyleProp<ViewStyle>;
  showMarker?: boolean;
};

export default function DiscoveryLocationMap({
  region,
  marker,
  onPress,
  onRegionChangeComplete,
  style,
  showMarker = true,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const markerIconRef = useRef<any>(null);
  const onPressRef = useRef(onPress);
  const onRegionChangeRef = useRef(onRegionChangeComplete);

  const selectedCoordinate = useMemo(
    () => marker ?? { latitude: region.latitude, longitude: region.longitude },
    [marker, region.latitude, region.longitude]
  );

  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  useEffect(() => {
    onRegionChangeRef.current = onRegionChangeComplete;
  }, [onRegionChangeComplete]);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapContainerRef.current || mapRef.current) {
          return;
        }

        const initialLatLng: [number, number] = [region.latitude, region.longitude];
        const map = L.map(mapContainerRef.current, {
          center: initialLatLng,
          zoom: regionToZoom(region.latitudeDelta),
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        markerIconRef.current = createDefaultMarkerIcon(L);

        if (showMarker && marker) {
          markerRef.current = L.marker(
            [marker.latitude, marker.longitude],
            { icon: markerIconRef.current }
          ).addTo(map);
        }

        map.on('click', (event: any) => {
          const coordinate = {
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          };

          if (showMarker) {
            if (markerRef.current) {
              markerRef.current.setLatLng([coordinate.latitude, coordinate.longitude]);
            } else {
              markerRef.current = L.marker([coordinate.latitude, coordinate.longitude], {
                icon: markerIconRef.current,
              }).addTo(map);
            }
          }

          onPressRef.current({ nativeEvent: { coordinate } });
        });

        map.on('moveend', () => {
          onRegionChangeRef.current?.(mapCenterToRegion(map));
        });

        mapRef.current = map;
      } catch (error) {
        console.warn('Failed to initialize discovery map on web:', error);
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

    mapRef.current.setView(
      [region.latitude, region.longitude],
      regionToZoom(region.latitudeDelta)
    );
  }, [region.latitude, region.longitude, region.latitudeDelta]);

  useEffect(() => {
    if (!mapRef.current || !window.L || !markerIconRef.current) {
      return;
    }

    if (!showMarker || !marker) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const latLng: [number, number] = [marker.latitude, marker.longitude];
    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
      markerRef.current.setIcon(markerIconRef.current);
    } else {
      markerRef.current = window.L.marker(latLng, { icon: markerIconRef.current }).addTo(mapRef.current);
    }
  }, [marker?.latitude, marker?.longitude, showMarker]);

  return (
    <View style={[{ flex: 1, backgroundColor: '#f8fbf9' }, style]}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
}
