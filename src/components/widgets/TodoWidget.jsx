import { useState, useRef, useEffect } from 'react';
import { getTodos, addTodo, toggleTodo, deleteTodo, clearDone } from '../../utils/todoStorage';

export default function TodoWidget() {
  const [todos, setTodos] = useState(() => getTodos());
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const doneCount = todos.filter(t => t.done).length;

  function handleAdd(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos(addTodo(input));
    setInput('');
    inputRef.current?.focus();
  }

  function handleToggle(id) {
    setTodos(toggleTodo(id));
  }

  function handleDelete(id) {
    setTodos(deleteTodo(id));
  }

  function handleClearDone() {
    setTodos(clearDone());
  }

  return (
    <div className="widget todo-widget">
      <div className="widget-header">
        <h2 className="widget-title">To-Do</h2>
        {doneCount > 0 && (
          <button className="widget-btn" onClick={handleClearDone} title="Clear completed">
            Clear {doneCount} done
          </button>
        )}
      </div>

      <form className="todo-form" onSubmit={handleAdd}>
        <input
          ref={inputRef}
          className="todo-input"
          type="text"
          placeholder="Add a task…"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button className="widget-btn todo-add-btn" type="submit" disabled={!input.trim()}>
          Add
        </button>
      </form>

      {todos.length === 0 && (
        <p className="widget-placeholder">No tasks yet. Add one above.</p>
      )}

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={`todo-item${todo.done ? ' todo-item--done' : ''}`}>
            <button
              className="todo-check"
              onClick={() => handleToggle(todo.id)}
              title={todo.done ? 'Mark incomplete' : 'Mark complete'}
              aria-label={todo.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {todo.done ? '✓' : ''}
            </button>
            <span className="todo-text">{todo.text}</span>
            <button
              className="todo-delete"
              onClick={() => handleDelete(todo.id)}
              title="Delete"
              aria-label="Delete task"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
