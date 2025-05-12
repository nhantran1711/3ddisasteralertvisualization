import React, { useRef, useMemo, useEffect } from 'react';
import Globe from 'react-globe.gl';

const DisasterGlobe = ({ events }) => {
  const globeRef = useRef();
  const categoryMapRef = useRef({});
  let nextCategoryIndex = 0;

  const disasterColours = ['red', 'orange', 'yellow', 'purple', 'pink'];

  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events.map((event) => {
      const coords = event.geometry?.[0]?.coordinates;
      const categoryTitle = event.categories?.[0]?.title || 'Unknown';

      if (!(categoryTitle in categoryMapRef.current)) {
        categoryMapRef.current[categoryTitle] = nextCategoryIndex++;
      }

      const categoryIndex = categoryMapRef.current[categoryTitle];

      if (coords && coords.length === 2) {
        return {
          lat: coords[1],
          lng: coords[0],
          label: `${event.title}`,
          categoryIndex,
          size: 0.1
        };
      }

      return null;
    }).filter(Boolean);
  }, [events]);

  // Enable auto-rotation on mount
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls(); // OrbitControls instance
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5; // Adjust rotation speed
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl='//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png'
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointLabel="label"
        pointAltitude="size"
        pointColor={(point) =>
          disasterColours[point.categoryIndex % disasterColours.length] || 'white'
        }
        animateIn
      />
    </div>
  );
};

export default DisasterGlobe;
