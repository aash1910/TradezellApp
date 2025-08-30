import React from 'react';
import { Svg, Path, Rect } from 'react-native-svg';

interface MapButtonIconProps {
  size?: number;
  color?: string;
}

export const MapButtonIcon: React.FC<MapButtonIconProps> = ({ size = 44, color = 'white' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <Rect width={size} height={size} rx="12" fill={color} fillOpacity="0.15"/>
      <Path
        d="M22 14C18.13 14 15 17.13 15 21C15 25.87 22 30 22 30C22 30 29 25.87 29 21C29 17.13 25.87 14 22 14ZM22 23C20.34 23 19 21.66 19 20C19 18.34 20.34 17 22 17C23.66 17 25 18.34 25 20C25 21.66 23.66 23 22 23Z"
        fill={color}
      />
    </Svg>
  );
};
