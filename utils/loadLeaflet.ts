declare global {
  interface Window {
    L?: any;
  }
}

const LEAFLET_CSS_ID = 'leaflet-css-cdn';
const LEAFLET_JS_ID = 'leaflet-js-cdn';

export const loadLeaflet = (): Promise<any> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is unavailable'));
  }

  if (window.L) {
    return Promise.resolve(window.L);
  }

  return new Promise((resolve, reject) => {
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const css = document.createElement('link');
      css.id = LEAFLET_CSS_ID;
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }

    const existingScript = document.getElementById(LEAFLET_JS_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.L));
      existingScript.addEventListener('error', () => reject(new Error('Leaflet failed to load')));
      return;
    }

    const js = document.createElement('script');
    js.id = LEAFLET_JS_ID;
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.async = true;
    js.onload = () => resolve(window.L);
    js.onerror = () => reject(new Error('Leaflet failed to load'));
    document.body.appendChild(js);
  });
};

export const createDefaultMarkerIcon = (L: any) =>
  L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const regionToZoom = (latitudeDelta: number) => {
  const zoom = Math.round(Math.log2(360 / Math.max(latitudeDelta, 0.001)));
  return Math.min(19, Math.max(3, zoom));
};

export const mapCenterToRegion = (map: any): MapRegion => {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const latitudeDelta = Math.abs(bounds.getNorth() - bounds.getSouth());
  const longitudeDelta = Math.abs(bounds.getEast() - bounds.getWest());

  return {
    latitude: center.lat,
    longitude: center.lng,
    latitudeDelta,
    longitudeDelta,
  };
};
