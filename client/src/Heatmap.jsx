import React, { useRef, useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';

const EARTH_URL = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-dark.jpg';

const HeatmapGlobe = ({ events, intensity = 2 }) => {
  const globeRef  = useRef();
  const earthImg  = useRef(null);          // cache the loaded base image
  const [texture, setTexture] = useState(EARTH_URL);

  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({ lat: e.latitude, lng: e.longitude }));
  }, [events]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, []);

  // Redraw whenever points or intensity changes
  useEffect(() => {
    if (!points.length) { setTexture(EARTH_URL); return; }

    const draw = (base) => {
      const radius = 10 + (intensity - 1) * 17.5;
      const alpha  = 0.45 + (intensity - 1) * 0.25;

      const canvas = document.createElement('canvas');
      canvas.width  = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');

      if (base) ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      points.forEach(({ lat, lng }) => {
        const x = (lng + 180) * (canvas.width  / 360);
        const y = (90 - lat) * (canvas.height / 180);

        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0,   `rgba(255,80,0,${alpha})`);
        g.addColorStop(0.4, `rgba(255,40,0,${(alpha * 0.5).toFixed(2)})`);
        g.addColorStop(1,   'rgba(255,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      });

      setTexture(canvas.toDataURL());
    };

    if (earthImg.current) {
      draw(earthImg.current);
    } else {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload  = () => { earthImg.current = img; draw(img); };
      img.onerror = () => draw(null);   // fallback: heatmap on black globe
      img.src = EARTH_URL;
    }
  }, [points, intensity]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Globe
        ref={globeRef}
        globeImageUrl={texture}
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        animateIn
      />
    </div>
  );
};

export default HeatmapGlobe;
