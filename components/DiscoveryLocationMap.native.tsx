import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type MarkerCoord = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: Region;
  marker: MarkerCoord | null;
  onPress: (e: any) => void;
  onRegionChangeComplete?: (region: Region) => void;
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
  return (
    <MapView
      style={[{ flex: 1 }, style]}
      region={region}
      onRegionChangeComplete={onRegionChangeComplete}
      onPress={onPress}
    >
      {showMarker && marker && <Marker coordinate={marker} />}
    </MapView>
  );
}
