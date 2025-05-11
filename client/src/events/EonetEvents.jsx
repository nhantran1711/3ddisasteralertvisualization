import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EonetEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/eonet');
        console.log('Fetched events data:', response.data); // Log the data to inspect its structure
        setEvents(response.data.events || []); // Access events array from the response
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {events.length > 0 ? (
        events.map((event) => {
          // Extract coordinates with a fallback check
          const coordinates = event.geometry?.coordinates;
          const latitude = coordinates?.[1] || 'N/A';
          const longitude = coordinates?.[0] || 'N/A';

          return (
            <div key={event.id}>
              <h3>{event.title}</h3>

              {/* Category */}
              <p>Category: {event.categories?.[0]?.title || 'N/A'}</p>

              {/* Magnitude (check if geometry exists and has magnitudeValue) */}
              <p>Magnitude: {event.geometry?.[0]?.magnitudeValue || 'N/A'}</p>

              {/* Date (check if geometry exists and has date) */}
              <p>Date: {event.geometry?.[0]?.date || 'N/A'}</p>

              {/* Location (check if coordinates are available) */}
              <p>Location: 
                {event.geometry?.[0]?.coordinates?.[0] && event.geometry?.[0]?.coordinates?.[1]
                  ? `(${event.geometry[0].coordinates[0]}, ${event.geometry[0].coordinates[1]})`
                  : 'N/A'}
              </p>
            </div>
          );
        })
      ) : (
        <p>No events available.</p>
      )}
    </div>
  );
};

export default EonetEvents;
