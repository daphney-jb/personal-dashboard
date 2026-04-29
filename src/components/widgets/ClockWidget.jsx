import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'nexboard_pomodoro';
const CIRCUMFERENCE = 2 * Math.PI * 54;

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && typeof s.workMins === 'number' && typeof s.breakMins === 'number') return s;
  } catch { /**/ }
  return { workMins: 25, breakMins: 5 };
}

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ClockWidget() {
  const [mode, setMode] = useState('clock');
  const [time, setTime] = useState(new Date());

  const [settings, setSettings] = useState(loadSettings);
  const [phase, setPhase] = useState('work');
  const [remaining, setRemaining] = useState(() => loadSettings().workMins * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editWork, setEditWork] = useState(() => String(loadSettings().workMins));
  const [editBreak, setEditBreak] = useState(() => String(loadSettings().breakMins));

  // Refs so the interval closure always reads current values
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    if (mode !== 'clock') return;
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'pomodoro' || !running) return;
    const id = setInterval(() => {
      setRemaining(r => {
        if (r > 1) return r - 1;
        const nextPhase = phaseRef.current === 'work' ? 'break' : 'work';
        setPhase(nextPhase);
        setRunning(false);
        return (nextPhase === 'work' ? settingsRef.current.workMins : settingsRef.current.breakMins) * 60;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, running]);

  function switchMode(m) {
    setMode(m);
    setRunning(false);
    if (m === 'pomodoro') {
      setPhase('work');
      setRemaining(settings.workMins * 60);
      setShowSettings(false);
    }
  }

  function handleApplySettings() {
    const wm = Math.max(1, Math.min(99, parseInt(editWork) || 25));
    const bm = Math.max(1, Math.min(99, parseInt(editBreak) || 5));
    const next = { workMins: wm, breakMins: bm };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEditWork(String(wm));
    setEditBreak(String(bm));
    setRunning(false);
    setPhase('work');
    setRemaining(wm * 60);
    setShowSettings(false);
  }

  const total = (phase === 'work' ? settings.workMins : settings.breakMins) * 60;
  const dashoffset = CIRCUMFERENCE * (1 - remaining / total);
  const ringColor = phase === 'work' ? 'var(--accent)' : '#4caf50';
  const startLabel = running ? 'Pause' : remaining === total ? 'Start' : 'Resume';

  return (
    <div className="widget clock-widget">
      <div className="widget-header">
        <h2 className="widget-title">Clock</h2>
        <div className="widget-header-actions">
          <button
            className={`widget-btn${mode === 'clock' ? ' widget-btn--active' : ''}`}
            onClick={() => switchMode('clock')}
          >
            Clock
          </button>
          <button
            className={`widget-btn${mode === 'pomodoro' ? ' widget-btn--active' : ''}`}
            onClick={() => switchMode('pomodoro')}
          >
            Pomodoro
          </button>
          {mode === 'pomodoro' && (
            <button
              className={`widget-btn${showSettings ? ' widget-btn--active' : ''}`}
              onClick={() => setShowSettings(s => !s)}
              title="Configure intervals"
            >
              ⚙
            </button>
          )}
        </div>
      </div>

      {mode === 'clock' && (
        <div className="clock-face">
          <div className="clock-time">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="clock-date">
            {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      )}

      {mode === 'pomodoro' && (
        <>
          {showSettings && (
            <div className="pomo-settings">
              <div className="pomo-settings-row">
                <label className="pomo-settings-label">Work</label>
                <input
                  className="pomo-settings-input"
                  type="number"
                  min="1"
                  max="99"
                  value={editWork}
                  onChange={e => setEditWork(e.target.value)}
                />
                <span className="pomo-settings-unit">min</span>
              </div>
              <div className="pomo-settings-row">
                <label className="pomo-settings-label">Break</label>
                <input
                  className="pomo-settings-input"
                  type="number"
                  min="1"
                  max="99"
                  value={editBreak}
                  onChange={e => setEditBreak(e.target.value)}
                />
                <span className="pomo-settings-unit">min</span>
              </div>
              <button className="widget-btn" onClick={handleApplySettings}>Apply</button>
            </div>
          )}

          <div className="pomo-face">
            <div className="pomo-phase-label">{phase === 'work' ? 'Work' : 'Break'}</div>
            <div className="pomo-ring-wrap">
              <svg className="pomo-ring" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  className="pomo-ring-track"
                  cx="60" cy="60" r="54"
                  fill="none"
                  strokeWidth="6"
                />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  strokeWidth="6"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ stroke: ringColor, transition: 'stroke-dashoffset 0.5s linear, stroke 0.3s' }}
                />
              </svg>
              <div className="pomo-countdown">{fmt(remaining)}</div>
            </div>
            <div className="pomo-controls">
              <button className="widget-btn pomo-btn" onClick={() => setRunning(r => !r)}>
                {startLabel}
              </button>
              <button className="widget-btn pomo-btn" onClick={() => { setRunning(false); setPhase('work'); setRemaining(settings.workMins * 60); }}>
                Reset
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
