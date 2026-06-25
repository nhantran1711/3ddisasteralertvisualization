import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES } from './data/countries';

const glassPanel = {
  borderRadius: 12,
  border: '1px solid rgba(249,115,22,0.3)',
  background: 'rgba(10,10,10,0.9)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

export default function CountrySearch({ onSelect, onClear }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef();

  const matches = query.trim().length > 0
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(country) {
    setQuery(country.name);
    setOpen(false);
    onSelect(country);
  }

  function handleClear() {
    setQuery('');
    setOpen(false);
    onClear();
  }

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: 320 }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 11, color: 'rgba(255,255,255,0.35)', fontSize: 13, pointerEvents: 'none' }}>
          &#128269;
        </span>
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search country…"
          style={{
            width: '100%',
            padding: '10px 36px 10px 32px',
            ...glassPanel,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            boxSizing: 'border-box',
            caretColor: '#fb923c',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute', right: 8,
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 18,
              cursor: 'pointer', lineHeight: 1, padding: '2px 5px',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            ×
          </button>
        )}
      </div>

      {open && matches.length > 0 && (
        <div style={{ marginTop: 4, ...glassPanel, overflow: 'hidden' }}>
          {matches.map((country, i) => (
            <button
              key={country.name}
              onClick={() => handleSelect(country)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px',
                background: 'none', border: 'none',
                borderBottom: i < matches.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                color: 'rgba(255,255,255,0.75)', fontSize: 13,
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(249,115,22,0.15)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
              }}
            >
              {country.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
