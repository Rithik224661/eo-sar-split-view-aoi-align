
import React, { useEffect, useRef } from 'react';
import type { Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen/Control.FullScreen.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import L from 'leaflet';
import 'leaflet.fullscreen';
import 'leaflet-side-by-side';
import 'leaflet-draw';
import type { AOI } from '../types';

// These are now on the window object after being loaded from the CDN
interface CustomWindow extends Window {
  GeoTIFF?: any;
  parseGeoraster?: any;
  GeoRasterLayer?: any;
}
declare const window: CustomWindow;


interface MapContainerProps {
  imageAFile?: File;
  imageBFile?: File;
  processedOutputs?: { imageAUrl: string; imageBUrl: string; } | null;
  showProcessed: boolean;
  onAoiDrawn: (aoi: AOI) => void;
  onAoiReset: () => void;
  resetAoiTrigger: number;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  imageAFile, 
  imageBFile,
  processedOutputs,
  showProcessed,
  onAoiDrawn,
  onAoiReset,
  resetAoiTrigger
}) => {
  const mapRef = useRef<Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const sbsControlRef = useRef<any>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const layerARef = useRef<any>(null);
  const layerBRef = useRef<any>(null);

  useEffect(() => {
    if (resetAoiTrigger > 0 && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, [resetAoiTrigger]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        fullscreenControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);
      
      mapRef.current = map;

      // Add draw controls
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
        draw: {
          polygon: false,
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
          rectangle: {
            shapeOptions: {
              color: '#00ffff',
              fillColor: '#00ffff',
              fillOpacity: 0.1,
            },
          },
        },
      });
      map.addControl(drawControl);
      drawControlRef.current = drawControl;

      map.on(L.Draw.Event.CREATED, (event: any) => {
        drawnItems.clearLayers();
        const layer = event.layer;
        drawnItems.addLayer(layer);
        const bounds = layer.getBounds();
        onAoiDrawn({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      });
      
      map.on(L.Draw.Event.DELETED, () => {
        onAoiReset();
      });
    }

    const addRasterLayer = async (fileOrUrl: File | string, isSideA: boolean) => {
      if (!mapRef.current) return;

      // Check if the required global libraries from the CDN are loaded
      if (typeof window.GeoTIFF === 'undefined' || typeof window.parseGeoraster === 'undefined' || typeof window.GeoRasterLayer === 'undefined') {
        console.error('Required geospatial libraries (GeoTIFF, parseGeoraster, GeoRasterLayer) are not loaded. Check the script tags in index.html.');
        alert('Error: Geospatial libraries failed to load. The map cannot display GeoTIFF files.');
        return;
      }
      
      try {
        let arrayBuffer: ArrayBuffer;
        if (typeof fileOrUrl === 'string') {
          const response = await fetch(fileOrUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch raster data from URL: ${response.statusText}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          arrayBuffer = await fileOrUrl.arrayBuffer();
        }

        const georaster = await window.parseGeoraster(arrayBuffer);
        const layer = new window.GeoRasterLayer({
          georaster: georaster,
          opacity: 1,
          resolution: 256,
        });

        if (isSideA) {
            layerARef.current = layer;
        } else {
            layerBRef.current = layer;
        }
        
        // This is a bit of a hack to get layer bounds
        const { xmin, ymin, xmax, ymax } = georaster;
        const bounds = L.latLngBounds(L.latLng(ymin, xmin), L.latLng(ymax, xmax));
        if (bounds.isValid()) {
            mapRef.current.fitBounds(bounds);
        }

      } catch (error) {
        console.error('Error processing GeoTIFF:', error);
        alert(`An error occurred while trying to display the GeoTIFF file. It might be an invalid or unsupported format. See the console for details.`);
      }
    };
    
    const updateLayers = async () => {
      if (sbsControlRef.current) {
        sbsControlRef.current.remove();
        sbsControlRef.current = null;
      }
      if(layerARef.current) mapRef.current?.removeLayer(layerARef.current);
      if(layerBRef.current) mapRef.current?.removeLayer(layerBRef.current);
      layerARef.current = null;
      layerBRef.current = null;

      const fileA = showProcessed && processedOutputs ? processedOutputs.imageAUrl : imageAFile;
      const fileB = showProcessed && processedOutputs ? processedOutputs.imageBUrl : imageBFile;

      if (fileA) await addRasterLayer(fileA, true);
      if (fileB) await addRasterLayer(fileB, false);

      if (mapRef.current && layerARef.current && layerBRef.current) {
        sbsControlRef.current = L.control.sideBySide(layerARef.current, layerBRef.current).addTo(mapRef.current);
      } else if (mapRef.current) {
          if (layerARef.current) layerARef.current.addTo(mapRef.current);
          if (layerBRef.current) layerBRef.current.addTo(mapRef.current);
      }
    };

    updateLayers();

    // Cleanup
    return () => {
        // Revoke Object URLs to prevent memory leaks
        if (processedOutputs?.imageAUrl && processedOutputs.imageAUrl.startsWith('blob:')) {
          URL.revokeObjectURL(processedOutputs.imageAUrl);
        }
        if (processedOutputs?.imageBUrl && processedOutputs.imageBUrl.startsWith('blob:')) {
          URL.revokeObjectURL(processedOutputs.imageBUrl);
        }
    };
  }, [imageAFile, imageBFile, processedOutputs, showProcessed, onAoiDrawn, onAoiReset]);


  return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapContainer;
