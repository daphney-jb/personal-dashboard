import { useState, useRef } from 'react';
import WeatherWidget from '../components/widgets/WeatherWidget';
import TodoWidget from '../components/widgets/TodoWidget';
import NewsFeedWidget from '../components/widgets/NewsFeedWidget';
import WhiteboardWidget from '../components/widgets/WhiteboardWidget';
import { getLayout, saveLayout } from '../utils/layoutStorage';

const WIDGETS = {
  weather: <WeatherWidget />,
  todo: <TodoWidget />,
  news: <NewsFeedWidget />,
  whiteboard: <WhiteboardWidget />,
};

export default function Dashboard() {
  const [order, setOrder] = useState(() => getLayout());
  const dragId = useRef(null);
  const [dragOver, setDragOver] = useState(null);

  function handleDragStart(id) {
    dragId.current = id;
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (id !== dragId.current) setDragOver(id);
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    const from = dragId.current;
    if (!from || from === targetId) {
      setDragOver(null);
      return;
    }
    const next = [...order];
    const fromIdx = next.indexOf(from);
    const toIdx = next.indexOf(targetId);
    next.splice(fromIdx, 1);
    next.splice(toIdx, 0, from);
    setOrder(next);
    saveLayout(next);
    dragId.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragId.current = null;
    setDragOver(null);
  }

  return (
    <div className="widget-grid">
      {order.map(id => (
        <div
          key={id}
          className={`drag-wrapper${dragOver === id ? ' drag-wrapper--over' : ''}`}
          draggable
          onDragStart={() => handleDragStart(id)}
          onDragOver={e => handleDragOver(e, id)}
          onDrop={e => handleDrop(e, id)}
          onDragEnd={handleDragEnd}
        >
          <div className="drag-handle" title="Drag to reorder">⠿</div>
          {WIDGETS[id]}
        </div>
      ))}
    </div>
  );
}
