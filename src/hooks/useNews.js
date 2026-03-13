import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'nexboard_news_cache';
const TOPIC_KEY = 'nexboard_news_topic';
const COUNTRY_KEY = 'nexboard_news_country';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const TOPIC_PATHS = {
  Top:           '',
  Technology:    'headlines/section/topic/TECHNOLOGY',
  Business:      'headlines/section/topic/BUSINESS',
  Sports:        'headlines/section/topic/SPORTS',
  Entertainment: 'headlines/section/topic/ENTERTAINMENT',
  Health:        'headlines/section/topic/HEALTH',
  Science:       'headlines/section/topic/SCIENCE',
};

export const COUNTRIES = {
  'United States':  { gl: 'US', hl: 'en-US',  ceid: 'US:en' },
  'United Kingdom': { gl: 'GB', hl: 'en-GB',  ceid: 'GB:en' },
  'Canada':         { gl: 'CA', hl: 'en-CA',  ceid: 'CA:en' },
  'Australia':      { gl: 'AU', hl: 'en-AU',  ceid: 'AU:en' },
  'India':          { gl: 'IN', hl: 'en-IN',  ceid: 'IN:en' },
  'Germany':        { gl: 'DE', hl: 'de',     ceid: 'DE:de' },
  'France':         { gl: 'FR', hl: 'fr',     ceid: 'FR:fr' },
  'Japan':          { gl: 'JP', hl: 'ja',     ceid: 'JP:ja' },
  'Brazil':         { gl: 'BR', hl: 'pt-BR',  ceid: 'BR:pt-BR' },
  'Mexico':         { gl: 'MX', hl: 'es-419', ceid: 'MX:es-419' },
  'South Korea':    { gl: 'KR', hl: 'ko',     ceid: 'KR:ko' },
  'Italy':          { gl: 'IT', hl: 'it',     ceid: 'IT:it' },
  'Spain':          { gl: 'ES', hl: 'es',     ceid: 'ES:es' },
  'Netherlands':    { gl: 'NL', hl: 'nl',     ceid: 'NL:nl' },
  'South Africa':   { gl: 'ZA', hl: 'en-ZA',  ceid: 'ZA:en' },
};

function buildFeedUrl(topic, country) {
  const { gl, hl, ceid } = COUNTRIES[country] ?? COUNTRIES['United States'];
  const params = `hl=${hl}&gl=${gl}&ceid=${ceid}`;
  const path = TOPIC_PATHS[topic];
  return path
    ? `https://news.google.com/rss/${path}?${params}`
    : `https://news.google.com/rss?${params}`;
}

function cacheKey(topic, country) {
  return `${CACHE_KEY}_${country}_${topic}`;
}

function loadCache(topic, country) {
  try {
    const raw = localStorage.getItem(cacheKey(topic, country));
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CACHE_TTL) return cached.articles;
  } catch { /* ignore */ }
  return null;
}

function saveCache(topic, country, articles) {
  try {
    localStorage.setItem(cacheKey(topic, country), JSON.stringify({ articles, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

function loadSaved(key, fallback) {
  return localStorage.getItem(key) || fallback;
}

async function fetchFeed(topic, country) {
  const rssUrl = buildFeedUrl(topic, country);
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}&count=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'ok') throw new Error('Feed unavailable');
  return json.items.map(item => ({
    title: item.title,
    link: item.link,
    source: item.author || new URL(item.link).hostname.replace('www.', ''),
    pubDate: item.pubDate,
  }));
}

export function useNews() {
  const [topic, setTopicState] = useState(() => loadSaved(TOPIC_KEY, 'Top'));
  const [country, setCountryState] = useState(() => loadSaved(COUNTRY_KEY, 'United States'));
  const [articles, setArticles] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async (currentTopic, currentCountry, force = false) => {
    setLoading(true);
    setError(null);

    if (!force) {
      const cached = loadCache(currentTopic, currentCountry);
      if (cached) {
        setArticles(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const items = await fetchFeed(currentTopic, currentCountry);
      saveCache(currentTopic, currentCountry, items);
      setArticles(items);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const setTopic = useCallback((t) => {
    localStorage.setItem(TOPIC_KEY, t);
    setTopicState(t);
    setCountryState(c => { load(t, c); return c; });
  }, [load]);

  const setCountry = useCallback((c) => {
    localStorage.setItem(COUNTRY_KEY, c);
    setCountryState(c);
    setTopicState(t => { load(t, c); return t; });
  }, [load]);

  const refresh = useCallback(() => {
    setTopicState(t => { setCountryState(c => { load(t, c, true); return c; }); return t; });
  }, [load]);

  useEffect(() => {
    const t = loadSaved(TOPIC_KEY, 'Top');
    const c = loadSaved(COUNTRY_KEY, 'United States');
    load(t, c);
  }, []);

  return { articles, loading, error, lastUpdated, topic, setTopic, country, setCountry, refresh };
}
