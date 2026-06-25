import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { filterEvents } from '../utils/filterEvents';

const EonetEvents = ({ disasterType, setDisasterType, setFilteredEvents, setCategories, setLastSyncedAt }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [localCategories, setLocalCategories] = useState([]);

  const fetchData = async (attempt = 1) => {
    const maxRetries = 3;
    try {
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/events?_t=${Date.now()}`
      );
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/sync`);
      console.log('[REFRESH] NASA sync complete');
    } catch (err) {
      console.warn('[REFRESH] Sync failed, fetching cached data:', err.message);
    }
    try {
      await fetchData();
    } catch (err) {
      console.warn('[REFRESH] Fetch failed:', err.message);
    }
    setRefreshing(false);
  };

  if (loading) return <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading…</p>;
  if (error) return <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Category
        </label>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Fetch latest data"
          style={{
            background: 'none', border: 'none', padding: '2px 4px',
            color: refreshing ? 'rgba(249,115,22,0.4)' : '#fb923c',
            fontSize: 14, cursor: refreshing ? 'default' : 'pointer',
            lineHeight: 1,
            display: 'inline-flex', alignItems: 'center',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => { if (!refreshing) e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.color = refreshing ? 'rgba(249,115,22,0.4)' : '#fb923c'; }}
        >
          <span style={{
            display: 'inline-block',
            animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
          }}>&#8635;</span>
        </button>
      </div>
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
