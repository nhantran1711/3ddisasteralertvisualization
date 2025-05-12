import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { filterEvents } from '../utils/filterEvents';

const EonetEvents = ({ disasterType, setDisasterType, setFilteredEvents }) => {
  const [events, setEvents] = useState([]);  // Initialize as an empty array
  const [categories, setCategories] = useState([]);  // To store unique categories
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);

  const fetchData = async (attempt = 1) => {
    const maxRetries = 3;
    try {
      const response = await axios.get('http://localhost:4000/api/eonet');
      const fetchedEvents = response.data.events || [];  // Ensure it’s an array
      setEvents(fetchedEvents);
      setRetry(0); // Reset retry count if successful

      // Extract unique categories from the events (to populate the dropdown)
      const uniqueCategories = [
        ...new Set(fetchedEvents.map((event) => event.categories?.[0]?.title).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to fetch events');
      if (attempt < maxRetries) {
        setRetry(attempt);
        setTimeout(() => fetchData(attempt + 1), attempt * 1000); // Exponential backoff
      } else {
        setError('Failed to fetch events after multiple attempts.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000);  // Fetch data every minute
    return () => clearInterval(intervalId);  // Cleanup on unmount
  }, []);

  // Sort events by the latest date in the geometry array
  const sortEventsByDate = (events) => {
    return events.sort((a, b) => {
      const aDate = new Date(Math.max(...a.geometry.map((g) => new Date(g.date).getTime())));  // Get the latest date
      const bDate = new Date(Math.max(...b.geometry.map((g) => new Date(g.date).getTime())));  // Get the latest date
      return bDate - aDate;  // Sort in descending order (latest first)
    });
  };

  // Filter events based on the disasterType
  useEffect(() => {
    const filtered = filterEvents(events, disasterType);
    const sorted = sortEventsByDate(filtered); // Sort after filtering
    setFilteredEvents(sorted);  // Pass the sorted and filtered events to the parent component
  }, [disasterType, events, setFilteredEvents]);  // Re-run when disasterType or events change

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
        <option value="">All</option>
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
