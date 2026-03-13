import { useNews, TOPIC_PATHS, COUNTRIES } from '../../hooks/useNews';

function timeAgo(pubDate) {
  if (!pubDate) return '';
  const diff = Date.now() - new Date(pubDate).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NewsFeedWidget() {
  const { articles, loading, error, topic, setTopic, country, setCountry, refresh } = useNews();

  return (
    <div className="widget news-widget">
      <div className="widget-header">
        <h2 className="widget-title">News</h2>
        <div className="widget-header-actions">
          <select
            className="news-country-select"
            value={country}
            onChange={e => setCountry(e.target.value)}
            title="Select country"
          >
            {Object.keys(COUNTRIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="widget-btn" onClick={refresh} disabled={loading} title="Refresh">
            {loading ? '⏳' : '↻'}
          </button>
        </div>
      </div>

      <div className="news-topics">
        {Object.keys(TOPIC_PATHS).map(t => (
          <button
            key={t}
            className={`news-topic-btn${topic === t ? ' news-topic-btn--active' : ''}`}
            onClick={() => setTopic(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && !articles && <p className="widget-placeholder">Loading headlines…</p>}
      {error && <p className="widget-error">Could not load news: {error}</p>}

      {articles && (
        <ul className="news-list">
          {articles.map((item, i) => (
            <li key={i} className="news-item">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-title"
              >
                {item.title}
              </a>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-time">{timeAgo(item.pubDate)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
