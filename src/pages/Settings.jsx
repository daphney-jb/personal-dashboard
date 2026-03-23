import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { dark, toggle } = useTheme();

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
    </div>
  );
}
