import React from 'react';
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
} | null;

type Props = {
  region: Region;
  marker: MarkerCoord;
  onPress: (e: any) => void;
};

export default function MapPicker({ region, marker, onPress }: Props) {
  return (
    <MapView
      style={{ flex: 1, marginTop: -92 }}
      initialRegion={region}
      onPress={onPress}
    >
      {marker && <Marker coordinate={marker} />}
    </MapView>
  );
}
