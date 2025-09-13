import React from 'react';
import { Svg, Path, Rect } from 'react-native-svg';

interface CopyIconProps {
  size?: number;
  color?: string;
}

export const CopyIcon: React.FC<CopyIconProps> = ({ size = 20, color = '#212121' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Rect
        x="4"
        y="4"
        width="10"
        height="10"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Rect
        x="6"
        y="6"
        width="10"
        height="10"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </Svg>
  );
};
