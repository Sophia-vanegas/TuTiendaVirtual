import { useState } from 'react'

function Ejercicio9() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask.trim(), completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>9. Lista</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          value={newTask} 
          onChange={e => setNewTask(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && addTask()}
          placeholder="Nueva tarea (Enter para agregar)"
          style={{ flex: 1, padding: '0.5rem' }} 
        />
        <button onClick={addTask} style={{ padding: '0.5rem 1rem', background: '#646cff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Agregar
        </button>
      </div>
      <div style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
        Total: {tasks.length} | Completadas: {completedCount}
      </div>
      <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
        {tasks.map(task => (
          <li key={task.id} style={{
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.75rem', 
            borderBottom: '1px solid #eee',
            opacity: task.completed ? 0.6 : 1
          }}>
            <input 
              type="checkbox" 
              checked={task.completed} 
              onChange={() => toggleTask(task.id)} 
              style={{ marginRight: '1rem' }} 
            />
            <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.text}
            </span>
            <button 
              onClick={() => deleteTask(task.id)} 
              style={{
                padding: '0.25rem 0.5rem', 
                background: '#ef4444', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Ejercicio9
