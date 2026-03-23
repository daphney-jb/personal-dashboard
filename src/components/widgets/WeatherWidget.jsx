import { useState, useRef, useEffect } from 'react';
import { useWeather } from '../../hooks/useWeather';

export default function WeatherWidget() {
  const { data, loading, error, lastUpdated, locationLabel, refresh, setLocation, useMyLocation: requestMyLocation } = useWeather();
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState('');
  const [geoError, setGeoError] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setGeoError(null);
    await setLocation(query.trim());
    setEditing(false);
    setQuery('');
  }

  function handleUseMyLocation() {
    setEditing(false);
    setQuery('');
    setGeoError(null);
    requestMyLocation();
  }

  return (
    <div className="widget weather-widget">
      <div className="widget-header">
        <h2 className="widget-title">Weather</h2>
        <div className="widget-header-actions">
          <button
            className="widget-btn"
            onClick={() => { setEditing(e => !e); setGeoError(null); }}
            title="Change location"
          >
            📍
          </button>
          <button className="widget-btn" onClick={refresh} disabled={loading} title="Refresh">
            {loading ? '⏳' : '↻'}
          </button>
        </div>
      </div>

      {editing && (
        <form className="weather-location-form" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="weather-location-input"
            type="text"
            placeholder="City, State or ZIP code"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="weather-location-actions">
            <button className="widget-btn" type="submit" disabled={loading || !query.trim()}>
              Go
            </button>
            <button className="widget-btn" type="button" onClick={handleUseMyLocation}>
              Use my location
            </button>
            <button className="widget-btn" type="button" onClick={() => { setEditing(false); setQuery(''); }}>
              Cancel
            </button>
          </div>
          {geoError && <p className="widget-error">{geoError}</p>}
        </form>
      )}

      {loading && !data && <p className="widget-placeholder">Fetching weather…</p>}

      {error && <p className="widget-error">{error}</p>}

      {data && (
        <div className="weather-body">
          <div className="weather-main">
            <span className="weather-emoji">{data.emoji}</span>
            <span className="weather-temp">{data.temp}°F</span>
          </div>
          <p className="weather-condition">{data.condition}</p>
          <div className="weather-details">
            <span>💧 {data.humidity}%</span>
            <span>💨 {data.wind} mph</span>
          </div>
          <p className="weather-location">{locationLabel}</p>
          {lastUpdated && (
            <p className="weather-updated">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
