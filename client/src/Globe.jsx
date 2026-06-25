import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import Globe from 'react-globe.gl';

const disasterColours = ['red', 'orange', 'yellow', 'purple', 'pink'];
export { disasterColours };

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DisasterGlobe = forwardRef(function DisasterGlobe({ events, onEventClick, highlightCoords }, ref) {
  const globeRef = useRef();
  const categoryMapRef = useRef({});
  const nextCategoryIndex = useRef(0);

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng) {
      if (!globeRef.current) return;
      globeRef.current.controls().autoRotate = false;
      globeRef.current.pointOfView({ lat, lng, altitude: 1.5 }, 1500);
    },
    resumeRotation() {
      if (!globeRef.current) return;
      globeRef.current.controls().autoRotate = true;
    },
  }));

  const basePoints = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events
      .filter(event => event.latitude != null && event.longitude != null)
      .map(event => {
        const cat = event.categories || 'Unknown';
        if (!(cat in categoryMapRef.current)) {
          categoryMapRef.current[cat] = nextCategoryIndex.current++;
        }
        return {
          lat: event.latitude,
          lng: event.longitude,
          label: event.title,
          categoryIndex: categoryMapRef.current[cat],
          event,
        };
      });
  }, [events]);

  const points = useMemo(() => {
    if (!highlightCoords) return basePoints;
    return basePoints.map(p => ({
      ...p,
      highlighted: haversineKm(p.lat, p.lng, highlightCoords.lat, highlightCoords.lng) < 1000,
    }));
  }, [basePoints, highlightCoords]);

  const rings = useMemo(() => {
    if (!highlightCoords) return [];
    return [{ lat: highlightCoords.lat, lng: highlightCoords.lng }];
  }, [highlightCoords]);

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
        pointAltitude={p => p.highlighted ? 0.18 : (highlightCoords ? 0.04 : 0.1)}
        pointRadius={p => p.highlighted ? 0.5 : 0.3}
        pointColor={p => {
          const base = disasterColours[p.categoryIndex % disasterColours.length];
          if (!highlightCoords) return base;
          return p.highlighted ? base : '#222222';
        }}
        onPointClick={point => onEventClick && onEventClick(point.event)}
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => '#fb923c'}
        ringMaxRadius={4}
        ringPropagationSpeed={2}
        ringRepeatPeriod={900}
        animateIn
      />
    </div>
  );
});

export default DisasterGlobe;
