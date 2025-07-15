import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const ImageUploadIcon: React.FC<IconProps> = ({ size = 24, color = '#55B086' }) => {
  return (
    <Svg width={size} height={size * 0.96} viewBox="0 0 25 24" fill="none">
      <Path
        d="M3.5 16L7.96967 11.5303C8.30923 11.1908 8.76978 11 9.25 11C9.73022 11 10.1908 11.1908 10.5303 11.5303L14.5 15.5M14.5 15.5L16 17M14.5 15.5L16.4697 13.5303C16.8092 13.1908 17.2698 13 17.75 13C18.2302 13 18.6908 13.1908 19.0303 13.5303L21.5 16"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.5 2.5C8.27027 2.5 6.1554 2.5 4.75276 3.69797C4.55358 3.86808 4.36808 4.05358 4.19797 4.25276C3 5.6554 3 7.77027 3 12C3 16.2297 3 18.3446 4.19797 19.7472C4.36808 19.9464 4.55358 20.1319 4.75276 20.302C6.1554 21.5 8.27027 21.5 12.5 21.5C16.7297 21.5 18.8446 21.5 20.2472 20.302C20.4464 20.1319 20.6319 19.9464 20.802 19.7472C22 18.3446 22 16.2297 22 12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 5.5C16.5898 4.89316 18.1597 2.5 19 2.5C19.8403 2.5 21.4102 4.89316 22 5.5M19 3V9.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}; 