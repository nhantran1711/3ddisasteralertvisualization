import React, { useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';

const DisasterGlobe = ({ events }) => {
  const globeRef = useRef();
  const categoryMapRef = useRef({});
  let nextCategoryIndex = 0;

  // Define color 
  const disasterColours = [
    'red', 'orange', 'yellow', 'purple', 'pink'
  ];

  const points = useMemo(() => {
    if (!Array.isArray(events)) return [];

    return events.map((event) => {
      const coords = event.geometry?.[0]?.coordinates;
      const categoryTitle = event.categories?.[0]?.title || 'Unknown';

      // Assign a number to each unique category
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
        };
      }

      return null;
    }).filter(Boolean);
  }, [events]);

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
        pointAltitude={0.01}
        pointColor={(point) =>
          disasterColours[point.categoryIndex % disasterColours.length] || 'white'
        }
      />
    </div>
  );
};

export default DisasterGlobe;
