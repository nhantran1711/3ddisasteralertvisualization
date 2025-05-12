import React, { useState } from 'react';
import EonetEvents from './events/EonetEvents';
import DisasterGlobe from './Globe';
import HeatmapGlobe from './Heatmap';

function App() {
  const [disasterType, setDisasterType] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false); // State for toggle

  return (
    <div className="App">
      <div className='title'>
        Disaster Visualization
      </div>

      <EonetEvents
        disasterType={disasterType}
        setDisasterType={setDisasterType}
        setFilteredEvents={setFilteredEvents}  // Pass setFilteredEvents as a prop
      />

      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Show Points' : 'Show Heatmap'}
        </button>
      </div>

      {/* Toggle between DisasterGlobe and HeatmapGlobe */}
      {showHeatmap ? (
        <HeatmapGlobe events={filteredEvents} />
      ) : (
        <DisasterGlobe events={filteredEvents} />
      )}
    </div>
  );
}

export default App;
