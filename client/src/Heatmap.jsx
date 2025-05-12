import React, { useRef, useEffect, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const HeatmapGlobe = ({ events }) => {
  const globeRef = useRef();

  // Generate points from the events
  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];

    const pointsData = events.map((event) => {
      const coords = event.geometry?.[0]?.coordinates;

      if (coords && coords.length === 2) {
        return {
          lat: coords[1], // Latitude
          lng: coords[0], // Longitude
          weight: 1 + Math.random() // Adjust weight for randomness
        };
      }
      return null;
    }).filter(Boolean);

    console.log('Points:', pointsData);  // Log points for debugging
    return pointsData;
  }, [events]);

  // Enable auto-rotation for globe
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, []);

  // Create and apply heatmap texture to the globe
  useEffect(() => {
    if (!globeRef.current || points.length === 0) return;

    // Create canvas for heatmap
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // Width of the heatmap canvas
    canvas.height = 1024; // Height of the heatmap canvas
    const ctx = canvas.getContext('2d');

    points.forEach(({ lat, lng, weight }) => {
      // Convert lat/lng to canvas coordinates
      const x = (lng + 180) * (canvas.width / 360);
      const y = (90 - lat) * (canvas.height / 180);
      const radius = 20; // Increase radius for better visibility

      // Log coordinates for debugging
      console.log(`Drawing at lat: ${lat}, lng: ${lng}, weight: ${weight}`);

      // Draw heatmap on canvas using a radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(255,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Create a texture from the canvas
    const heatmapTexture = new THREE.CanvasTexture(canvas);
    heatmapTexture.minFilter = THREE.LinearFilter;
    heatmapTexture.magFilter = THREE.LinearFilter;
    heatmapTexture.needsUpdate = true;

    // Apply the heatmap texture to the globe material
    if (globeRef.current) {
      const globeMaterial = globeRef.current.globeMaterial;
      if (globeMaterial) {
        globeMaterial.map = heatmapTexture;
        globeMaterial.needsUpdate = true; // Force the material update
      }
    }
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
