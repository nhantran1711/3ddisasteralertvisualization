import React, { useState } from 'react';
import EonetEvents from './events/EonetEvents';
import DisasterGlobe from './Globe';
import HeatmapGlobe from './Heatmap';

function App() {
  const [disasterType, setDisasterType] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  return (
    <div className="App">
      <div className='title' >
        Disaster Visualization
      </div>
      <EonetEvents
        disasterType={disasterType}
        setDisasterType={setDisasterType}
        setFilteredEvents={setFilteredEvents}  // Pass setFilteredEvents as a prop
      />

      <DisasterGlobe events={filteredEvents} />  
      <HeatmapGlobe />
    </div>
  );
}

export default App;
