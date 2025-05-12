import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { filterEvents } from '../utils/filterEvents';

const EonetEvents = ({ disasterType, setDisasterType, setFilteredEvents }) => {
  const [events, setEvents] = useState([]);  // Initialize as an empty array
  const [categories, setCategories] = useState([]);  // To store unique categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/eonet');
      const fetchedEvents = response.data.events || [];  // Ensure it’s an array
      setEvents(fetchedEvents);

      // Extract unique categories from the events (to populate the dropdown)
      const uniqueCategories = [
        ...new Set(fetchedEvents.map((event) => event.categories?.[0]?.title).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);  // Fetch data every minute
    return () => clearInterval(intervalId);  // Cleanup on unmount
  }, []);

  // Filter events based on the disasterType
  useEffect(() => {
    const filtered = filterEvents(events, disasterType);
    setFilteredEvents(filtered);  // Pass the filtered events to the parent component
  }, [disasterType, events, setFilteredEvents]);  // Re-run when disasterType or events change

  useEffect(() => {
    if (!disasterType) {
      setFilteredEvents(events); // If no disaster type is selected, show all events
    } else {
      const filtered = filterEvents(events, disasterType);
      setFilteredEvents(filtered); // Apply filtering if a disaster type is selected
    }
  }, [disasterType, events]); // This will trigger whenever disasterType or events change
  

  // Function to handle changes in the dropdown (disasterType)
  const handleDisasterChange = (event) => {
    setDisasterType(event.target.value);  // Update the disaster type in the parent component
  };

  // Loading and error handling
  if (loading) {
    return <div>Waiting for data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Filter Events</h1>

      {/* Dropdown to select disaster type */}
      <select onChange={handleDisasterChange} value={disasterType}>
        <option value="">All </option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EonetEvents;
