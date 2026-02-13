const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjazA0eWRpNjAwMDAwMnFwb2R1YWptdDAwIn0.demo';

export const initMapbox = () => {
  if (typeof window !== 'undefined' && (window as any).mapboxgl) {
    (window as any).mapboxgl.accessToken = MAPBOX_TOKEN;
  }
};

export default {
  token: MAPBOX_TOKEN,
  defaultZoom: 6,
  defaultCenter: [-4.0, 5.3] as [number, number],
  style: 'mapbox://styles/mapbox/outdoors-v12',
};
