import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'nexboard_weather_cache';
const LOCATION_KEY = 'nexboard_weather_location';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const WMO_CODES = {
  0: { label: 'Clear sky', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Foggy', emoji: '🌫️' },
  48: { label: 'Icy fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌧️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  77: { label: 'Snow grains', emoji: '🌨️' },
  80: { label: 'Rain showers', emoji: '🌦️' },
  81: { label: 'Showers', emoji: '🌧️' },
  82: { label: 'Heavy showers', emoji: '⛈️' },
  85: { label: 'Snow showers', emoji: '🌨️' },
  86: { label: 'Heavy snow showers', emoji: '❄️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
  96: { label: 'Thunderstorm w/ hail', emoji: '⛈️' },
  99: { label: 'Thunderstorm w/ hail', emoji: '⛈️' },
};

function getCondition(code) {
  return WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CACHE_TTL) return cached;
  } catch { /* ignore */ }
  return null;
}

function saveCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

function loadSavedLocation() {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocation(loc) {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  } catch { /* ignore */ }
}

async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'NexBoard/1.0' } });
  if (!res.ok) throw new Error('Geocoding service unavailable');
  const results = await res.json();
  if (!results.length) throw new Error('Location not found. Try "Chicago, IL" or a zip code.');
  const parts = results[0].display_name.split(',');
  const label = parts.slice(0, 2).join(',').trim();
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon), label };
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
  });
}

async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const json = await res.json();
  const c = json.current;
  const condition = getCondition(c.weather_code);
  return {
    temp: Math.round(c.temperature_2m),
    humidity: c.relative_humidity_2m,
    wind: Math.round(c.wind_speed_10m),
    condition: condition.label,
    emoji: condition.emoji,
  };
}

export function useWeather() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationLabel, setLocationLabel] = useState(null);

  const load = useCallback(async (force = false, overrideCoords = null) => {
    setLoading(true);
    setError(null);

    if (!force && !overrideCoords) {
      const cached = loadCache();
      if (cached) {
        setData(cached);
        setLastUpdated(new Date(cached.timestamp));
        setLocationLabel(loadSavedLocation()?.label ?? 'Current location');
        setLoading(false);
        return;
      }
    }

    try {
      let lat, lon, label;

      if (overrideCoords) {
        ({ lat, lon, label } = overrideCoords);
      } else {
        const saved = loadSavedLocation();
        if (saved) {
          ({ lat, lon, label } = saved);
        } else {
          try {
            const pos = await getPosition();
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
            label = 'Current location';
          } catch {
            lat = 40.71; lon = -74.01;
            label = 'New York, NY';
          }
        }
      }

      const result = await fetchWeather(lat, lon);
      saveCache(result);
      setData(result);
      setLastUpdated(new Date());
      setLocationLabel(label);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setLocation = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const coords = await geocode(query);
      saveLocation(coords);
      localStorage.removeItem(CACHE_KEY);
      await load(true, coords);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [load]);

  const useMyLocation = useCallback(() => {
    localStorage.removeItem(LOCATION_KEY);
    localStorage.removeItem(CACHE_KEY);
    load(true);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, lastUpdated, locationLabel, refresh: () => load(true), setLocation, useMyLocation };
}
