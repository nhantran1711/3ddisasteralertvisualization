import React, { useState, useRef, useEffect } from 'react';
import EonetEvents from './events/EonetEvents';
import DisasterGlobe, { disasterColours } from './Globe';
import HeatmapGlobe from './Heatmap';
import CountrySearch from './CountrySearch';

const CATEGORY_EMOJIS = {
  'Wildfires': '🔥',
  'Earthquakes': '⚡',
  'Floods': '🌊',
  'Volcanoes': '🌋',
  'Severe Storms': '⛈️',
  'Drought': '🌵',
  'Landslides': '⛰️',
  'Sea and Lake Ice': '🧊',
  'Snow': '❄️',
  'Dust and Haze': '🌫️',
  'Water Color': '💧',
  'Temperature Extremes': '🌡️',
  'Manmade': '🏭',
};

function formatDate(iso) {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatUpdated(date) {
  if (!date) return null;
  const mins = Math.floor((Date.now() - date) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

function formatCoord(lat, lng) {
  if (lat == null || lng == null) return 'N/A';
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lng).toFixed(2)}°${ew}`;
}

const glassPanel = {
  borderRadius: 16,
  border: '1px solid rgba(249,115,22,0.3)',
  background: 'rgba(10,10,10,0.85)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

function App() {
  const [disasterType, setDisasterType] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [categories, setCategories] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [intensity, setIntensity] = useState(2);
  const [highlightCoords, setHighlightCoords] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const globeRef = useRef();
  const pendingFlyRef = useRef(null);

  useEffect(() => {
    if (!showHeatmap && pendingFlyRef.current) {
      const coords = pendingFlyRef.current;
      pendingFlyRef.current = null;
      setTimeout(() => globeRef.current?.flyTo(coords.lat, coords.lng), 200);
    }
  }, [showHeatmap]);

  const intensityLabel = intensity < 1.7 ? 'Low' : intensity < 2.4 ? 'Medium' : 'High';

  const displayedEvents = filteredEvents.filter(e => {
    if (!e.date) return true;
    const d = new Date(e.date);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const displayedCount = displayedEvents.filter(e => e.latitude != null && e.longitude != null).length;

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .detail-panel { animation: slideInRight 0.3s cubic-bezier(0.22,1,0.36,1); }
        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(249,115,22,0.25);
          outline: none;
        }
        input[type=date] {
          -webkit-appearance: none;
          color-scheme: dark;
          width: 100%;
          padding: 6px 8px;
          borderRadius: 8px;
          border: 1px solid rgba(249,115,22,0.3);
          background: rgba(249,115,22,0.08);
          color: #fff;
          font-size: 12px;
          outline: none;
          box-sizing: border-box;
        }
        input[type=date]::-webkit-calendar-picker-indicator {
          filter: invert(0.7) sepia(1) saturate(3) hue-rotate(340deg);
          cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fb923c;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(249,115,22,0.7);
        }
      `}</style>

      <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#000', overflow: 'hidden' }}>

        {showHeatmap ? (
          <HeatmapGlobe events={displayedEvents} intensity={intensity} />
        ) : (
          <DisasterGlobe
            ref={globeRef}
            events={displayedEvents}
            onEventClick={setSelectedEvent}
            highlightCoords={highlightCoords}
          />
        )}

        <CountrySearch
          onSelect={country => {
            setHighlightCoords({ lat: country.lat, lng: country.lng });
            if (showHeatmap) {
              pendingFlyRef.current = { lat: country.lat, lng: country.lng };
              setShowHeatmap(false);
            } else {
              globeRef.current?.flyTo(country.lat, country.lng);
            }
          }}
          onClear={() => {
            setHighlightCoords(null);
            globeRef.current?.resumeRotation();
          }}
        />

        {/* Left control panel */}
        <div style={{ position: 'fixed', top: 24, left: 24, zIndex: 9999, width: 220, display: 'flex', flexDirection: 'column', gap: 12, padding: 16, ...glassPanel }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: '#fb923c', fontWeight: 600 }}>{displayedCount}</span> events on display
            </p>
            {lastSyncedAt && (
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                Updated {formatUpdated(lastSyncedAt)}
              </p>
            )}
          </div>

          <EonetEvents
            disasterType={disasterType}
            setDisasterType={setDisasterType}
            setFilteredEvents={setFilteredEvents}
            setCategories={setCategories}
            setLastSyncedAt={setLastSyncedAt}
          />

          {/* Date range filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date Range</span>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(249,115,22,0.7)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fb923c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(249,115,22,0.7)'}
                >Clear</button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>From</label>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>To</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.15)', color: '#fdba74', fontSize: 13, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.28)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}
          >
            {showHeatmap ? 'Show Points' : 'Show Heatmap'}
          </button>

          {showHeatmap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intensity</span>
                <span style={{ fontSize: 11, color: '#fb923c', fontWeight: 600 }}>{intensityLabel}</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {['Low', 'Med', 'High'].map(l => (
                  <span key={l} style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{l}</span>
                ))}
              </div>
            </div>
          )}

          {categories.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Legend</p>
              {categories.map((cat, i) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: disasterColours[i % disasterColours.length], boxShadow: `0 0 6px ${disasterColours[i % disasterColours.length]}` }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event detail panel */}
        {selectedEvent && (
          <div
            className="detail-panel"
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, width: 280, display: 'flex', flexDirection: 'column', gap: 12, padding: 18, ...glassPanel }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedEvent.categories || 'Event'}
              </p>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
              >×</button>
            </div>

            <div style={{ height: 1, background: 'rgba(249,115,22,0.2)' }} />

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Title</span>
              <p style={{ margin: 0, fontSize: 14, color: '#fff', lineHeight: 1.4 }}>{selectedEvent.title}</p>
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Description</span>
              <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                {selectedEvent.description || 'No description available.'}
              </p>
            </div>

            {/* Location */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Location</span>
              <span style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace' }}>
                {formatCoord(selectedEvent.latitude, selectedEvent.longitude)}
              </span>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Date + Magnitude */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</span>
                <span style={{ fontSize: 12, color: '#fff' }}>{formatDate(selectedEvent.date)}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Magnitude</span>
                <span style={{ fontSize: 12, color: '#fff' }}>
                  {selectedEvent.magnitude != null
                    ? `${selectedEvent.magnitude}${selectedEvent.magnitudeUnit ? ' ' + selectedEvent.magnitudeUnit : ''}`
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* Links */}
            {(selectedEvent.sourceUrl || selectedEvent.link) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedEvent.sourceUrl && (
                  <a
                    href={selectedEvent.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(249,115,22,0.15)', color: '#fdba74',
                      border: '1px solid rgba(249,115,22,0.3)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(249,115,22,0.28)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(249,115,22,0.15)'}
                  >
                    View Source ↗
                  </a>
                )}
                {selectedEvent.link && (
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 11, padding: '5px 10px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  >
                    NASA EONET ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}

export default App;
