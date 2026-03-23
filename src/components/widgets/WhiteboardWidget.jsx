import { useState, useEffect } from 'react';
import { useCanvas } from '../../hooks/useCanvas';

const NOTES_KEY = 'nexboard_whiteboard_notes';
const COLORS = ['#1a1a1a', '#e74c3c', '#e67e22', '#2ecc71', '#3498db', '#9b59b6'];

export default function WhiteboardWidget() {
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#1a1a1a');
  const [size, setSize] = useState(4);
  const [notes, setNotes] = useState(() => localStorage.getItem(NOTES_KEY) || '');

  const { canvasRef, startDrawing, draw, stopDrawing, clear } = useCanvas();

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, notes);
  }, [notes]);

  function handleClear() {
    if (!window.confirm('Clear the whiteboard?')) return;
    clear();
  }

  return (
    <div className="widget whiteboard-widget">
      <div className="widget-header">
        <h2 className="widget-title">Whiteboard</h2>
        <div className="widget-header-actions">
          <button
            className={`widget-btn${tool === 'pen' ? ' wb-tool--active' : ''}`}
            onClick={() => setTool('pen')}
            title="Pen"
          >
            ✏️
          </button>
          <button
            className={`widget-btn${tool === 'eraser' ? ' wb-tool--active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            🧹
          </button>
          <button className="widget-btn" onClick={handleClear} title="Clear canvas">
            🗑️
          </button>
        </div>
      </div>

      <div className="wb-toolbar">
        <div className="wb-colors">
          {COLORS.map(c => (
            <button
              key={c}
              className={`wb-color-btn${color === c ? ' wb-color-btn--active' : ''}`}
              style={{ background: c }}
              onClick={() => { setColor(c); setTool('pen'); }}
              title={c}
            />
          ))}
          <input
            type="color"
            className="wb-color-custom"
            value={color}
            onChange={e => { setColor(e.target.value); setTool('pen'); }}
            title="Custom color"
          />
        </div>
        <div className="wb-size">
          <input
            type="range"
            min="1"
            max="24"
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            title="Stroke size"
          />
          <span className="wb-size-label">{size}px</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className={`wb-canvas${tool === 'eraser' ? ' wb-canvas--eraser' : ''}`}
        width={600}
        height={300}
        onMouseDown={e => startDrawing(e, tool, color, size)}
        onMouseMove={e => draw(e, tool, color, size)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={e => startDrawing(e, tool, color, size)}
        onTouchMove={e => draw(e, tool, color, size)}
        onTouchEnd={stopDrawing}
      />

      <textarea
        className="wb-notes"
        placeholder="Quick notes…"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
    </div>
  );
}
