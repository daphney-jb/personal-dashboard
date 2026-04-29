import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getVisible, saveVisible } from '../utils/layoutStorage';

const WIDGET_LABELS = {
  weather: { label: 'Weather', hint: 'Live temperature, humidity, and wind' },
  todo: { label: 'To-Do', hint: 'Task list with persistence' },
  news: { label: 'News Feed', hint: 'Filtered headlines from Google News' },
  whiteboard: { label: 'Whiteboard', hint: 'Freehand canvas and quick notes' },
  clock: { label: 'Clock / Pomodoro', hint: 'Live clock and configurable Pomodoro timer' },
};

export default function Settings() {
  const { dark, toggle } = useTheme();
  const [visible, setVisible] = useState(() => getVisible());

  function handleWidgetToggle(id) {
    const next = { ...visible, [id]: !visible[id] };
    setVisible(next);
    saveVisible(next);
  }

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <div className="settings-section">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark mode</div>
            <div className="settings-hint">Switch between light and dark theme</div>
          </div>
          <button
            className={`toggle-switch${dark ? ' toggle-switch--on' : ''}`}
            onClick={toggle}
            role="switch"
            aria-checked={dark}
            aria-label="Toggle dark mode"
          >
            <span className="toggle-thumb" />
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Widgets</h2>
        {Object.entries(WIDGET_LABELS).map(([id, { label, hint }]) => (
          <div key={id} className="settings-row">
            <div>
              <div className="settings-label">{label}</div>
              <div className="settings-hint">{hint}</div>
            </div>
            <button
              className={`toggle-switch${visible[id] ? ' toggle-switch--on' : ''}`}
              onClick={() => handleWidgetToggle(id)}
              role="switch"
              aria-checked={visible[id]}
              aria-label={`Toggle ${label} widget`}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
