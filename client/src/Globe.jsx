import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';

const DisasterGlobe = ({ events }) => {
  const globeRef = useRef();

  // Ensure events is an array before trying to map over it
  const points = Array.isArray(events)
    ? events
        .map((event) => {
          const coords = event.geometry?.[0]?.coordinates;
          if (coords && coords.length === 2) {
            return {
              lat: coords[1],
              lng: coords[0],
              label: event.title,
            };
          }
          return null;
        })
        .filter(Boolean) // Remove any null entries
    : [];

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointLabel="label"
        pointAltitude={0.01}
        pointColor={() => 'red'}
      />
    </div>
  );
};

export default DisasterGlobe;
