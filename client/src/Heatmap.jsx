import React, { useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const HeatmapGlobe = ({ events }) => {
  const globeRef = useRef();

  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events.map((event) => {
      const coords = event.geometry?.[0]?.coordinates;

      if (coords && coords.length === 2) {
        return {
          lat: coords[1],
          lng: coords[0],
          weight: 1 + Math.random() // you can adjust weight based on data
        };
      }
      return null;
    }).filter(Boolean);
  }, [events]);

  // Enable auto-rotation
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, []);

  // Create heatmap texture
  useEffect(() => {
    if (!globeRef.current || points.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    points.forEach(({ lat, lng, weight }) => {
      const x = (lng + 180) * (canvas.width / 360);
      const y = (90 - lat) * (canvas.height / 180);
      const radius = 10;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    const heatmapTexture = new THREE.CanvasTexture(canvas);
    globeRef.current.globeMaterial().map = heatmapTexture;
    globeRef.current.globeMaterial().map.needsUpdate = true;
  }, [points]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        animateIn
      />
    </div>
  );
};

export default HeatmapGlobe;
