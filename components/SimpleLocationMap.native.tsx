import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Props = {
  region: Region;
  markerTitle?: string;
  style?: StyleProp<ViewStyle>;
};

export default function SimpleLocationMap({ region, markerTitle, style }: Props) {
  return (
    <MapView style={[{ flex: 1 }, style]} initialRegion={region}>
      <Marker
        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
        title={markerTitle}
      />
    </MapView>
  );
}
