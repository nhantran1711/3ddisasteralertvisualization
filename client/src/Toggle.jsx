import React, { useState } from 'react';
import DisasterGlobe from './DisasterGlobe';
import HeatmapGlobe from './HeatmapGlobe';

const GlobeToggle = ({ events }) => {
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div>
      <div className="flex justify-end p-4">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Show Points' : 'Show Heatmap'}
        </button>
      </div>

      {showHeatmap ? (
        <HeatmapGlobe events={events} />
      ) : (
        <DisasterGlobe events={events} />
      )}
    </div>
  );
};

export default GlobeToggle;
