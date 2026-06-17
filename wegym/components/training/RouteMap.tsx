"use client";

import { useEffect, useRef } from 'react';

interface RouteMapProps {
  coordinates: { lat: number; lng: number }[];
  height?: number;
  interactive?: boolean;
}

export default function RouteMap({ coordinates, height = 200, interactive = true }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || coordinates.length < 2) return;

    let cancelled = false;

    async function init() {
      const L = (await import('leaflet')).default;

      if (cancelled) return;

      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      const el = mapRef.current;
      if (!el) return;
      const map = L.map(el, {
        zoomControl: interactive,
        attributionControl: interactive,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive,
        doubleClickZoom: interactive,
        keyboard: interactive,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: interactive ? '&copy; OpenStreetMap' : '',
      }).addTo(map);

      const latlngs: [number, number][] = coordinates.map(c => [c.lat, c.lng]);

      L.polyline(latlngs, {
        color: '#f97316',
        weight: 4,
        opacity: 0.85,
      }).addTo(map);

      const first = latlngs[0];
      if (first) {
        L.circleMarker(first, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 1,
          radius: 6,
        }).addTo(map);
      }

      const last = latlngs[latlngs.length - 1];
      if (last) {
        L.circleMarker(last, {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 1,
          radius: 6,
        }).addTo(map);
      }

      const poly = L.polyline(latlngs);
      map.fitBounds(poly.getBounds().pad(0.12));

      instanceRef.current = map;
    }

    init();

    return () => {
      cancelled = true;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [coordinates, interactive]);

  return (
    <div
      ref={mapRef}
      style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden' }}
    />
  );
}
