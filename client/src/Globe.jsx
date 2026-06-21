import React, { useRef, useMemo, useEffect } from 'react';
import Globe from 'react-globe.gl';

const disasterColours = ['red', 'orange', 'yellow', 'purple', 'pink'];
export { disasterColours };

const DisasterGlobe = ({ events, onEventClick }) => {
  const globeRef = useRef();
  const categoryMapRef = useRef({});
  let nextCategoryIndex = 0;

  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events
      .filter((event) => event.latitude != null && event.longitude != null)
      .map((event) => {
        const categoryTitle = event.categories || 'Unknown';

        if (!(categoryTitle in categoryMapRef.current)) {
          categoryMapRef.current[categoryTitle] = nextCategoryIndex++;
        }

        return {
          lat: event.latitude,
          lng: event.longitude,
          label: event.title,
          categoryIndex: categoryMapRef.current[categoryTitle],
          size: 0.1,
          event,
        };
      });
  }, [events]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointLabel="label"
        pointAltitude="size"
        pointColor={(point) => disasterColours[point.categoryIndex % disasterColours.length] || 'white'}
        onPointClick={(point) => onEventClick && onEventClick(point.event)}
        animateIn
      />
    </div>
  );
};

export default DisasterGlobe;
