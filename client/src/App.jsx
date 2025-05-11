import React, { useState } from 'react';
import EonetEvents from './events/EonetEvents';
import DisasterGlobe from './Globe';

function App() {
  const [disasterType, setDisasterType] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  return (
    <div className="App">
      <EonetEvents
        disasterType={disasterType}
        setDisasterType={setDisasterType}
        setFilteredEvents={setFilteredEvents}  // Pass setFilteredEvents as a prop
      />
      <DisasterGlobe events={filteredEvents} />  
    </div>
  );
}

export default App;
