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

export default function ProfileLocationMap({ region, marker, onPress }: Props) {
  return (
    <MapView style={{ flex: 1 }} region={region} onPress={onPress}>
      {marker && <Marker coordinate={marker} />}
    </MapView>
  );
}
