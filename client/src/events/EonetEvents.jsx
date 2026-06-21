import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { filterEvents } from '../utils/filterEvents';

const EonetEvents = ({ disasterType, setDisasterType, setFilteredEvents, setCategories, setLastSyncedAt }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);

  const fetchData = async (attempt = 1) => {
    const maxRetries = 3;
    try {
      const response = await axios.get('http://localhost:4000/api/events');
      const fetchedEvents = response.data.events || [];
      setEvents(fetchedEvents);
      setError(null);

      if (response.data.lastSyncedAt) {
        setLastSyncedAt(new Date(response.data.lastSyncedAt));
      }

      const uniqueCategories = [
        ...new Set(fetchedEvents.map((e) => e.categories).filter(Boolean)),
      ];
      setLocalCategories(uniqueCategories);
      setCategories(uniqueCategories);
    } catch (err) {
      if (attempt < maxRetries) {
        setTimeout(() => fetchData(attempt + 1), attempt * 1000);
      } else {
        setError('Could not reach server.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const filtered = filterEvents(events, disasterType);
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredEvents(sorted);
  }, [disasterType, events, setFilteredEvents]);

  if (loading) return <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading…</p>;
  if (error) return <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Category
      </label>
      <select
        onChange={(e) => setDisasterType(e.target.value)}
        value={disasterType}
        style={{
          width: '100%',
          borderRadius: 8,
          border: '1px solid rgba(249,115,22,0.3)',
          background: 'rgba(249,115,22,0.1)',
          color: '#fff',
          fontSize: 13,
          padding: '7px 10px',
          outline: 'none',
        }}
      >
        <option value="" style={{ background: '#111' }}>All categories</option>
        {localCategories.map((category) => (
          <option key={category} value={category} style={{ background: '#111' }}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EonetEvents;
