/** @jsx createElement */
import { createElement, useState } from './jsx-runtime';

type Todo = { id: number; text: string; completed: boolean };
type Filter = 'all' | 'active' | 'completed';

function createTodo(text: string): Todo {
  return { id: Date.now(), text, completed: false };
}

export function TodoApp() {
  const [getTodos, setTodos] = useState<Todo[]>([]);
  const [getFilter, setFilter] = useState<Filter>('all');
  const [getInput, setInput] = useState('');

  const todos = getTodos();
  const filter = getFilter();
  const inputValue = getInput();

  const filtered = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;

  const submit = (event: Event) => {
    event.preventDefault();
    const value = getInput().trim();
    if (!value) return;
    setTodos(prev => [...prev, createTodo(value)]);
    setInput('');
  };

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearAllTodos = () => {
    setTodos([]);
  };

  const focusInput = (node: Element | null) => {
    if (!node) return;
    requestAnimationFrame(() => {
      const inputNode = node as HTMLInputElement;
      const len = inputNode.value.length;
      inputNode.focus();
      try {
        inputNode.setSelectionRange(len, len);
      } catch {
        /* ignore selection errors for unsupported input types */
      }
    });
  };

  return (
    <div className="todo-app" style={{ maxWidth: 420 }}>
      <h1>Todo App</h1>

      <form onSubmit={submit} style={{ display: 'flex', gap: 8 }}>
        <input
          ref={focusInput}
          value={inputValue}
          placeholder="Add todo..."
          onInput={(event: Event) => {
            const target = event.target as HTMLInputElement;
            setInput(target.value);
          }}
        />
        <button type="submit">Add</button>
      </form>

      <div className="counts" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
        <span>Total: {total}</span>
        <span>Completed: {completed}</span>
      </div>

      <div className="filters" style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>
          All
        </button>
        <button onClick={() => setFilter('active')} className={filter === 'active' ? 'active' : ''}>
          Active
        </button>
        <button onClick={() => setFilter('completed')} className={filter === 'completed' ? 'active' : ''}>
          Completed
        </button>
        <button onClick={clearAllTodos} style={{ marginLeft: 'auto' }}>
          Clear All
        </button>
      </div>

      <ul style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(todo => (
          <li
            key={todo.id}
            className={todo.completed ? 'completed' : ''}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
            <span style={{ flex: 1, textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
 