import { useState } from 'react'

function Ejercicio4() {
  const [str, setStr] = useState('');
  const [res, setRes] = useState('');

  const checkCase = () => {
    if (!str) return;
    const upper = str === str.toUpperCase();
    const lower = str === str.toLowerCase();
    setRes(upper ? 'Todas mayúsculas' : lower ? 'Todas minúsculas' : '');
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>4. Mayúsculas/Minúsculas</h2>
      <input type="text" value={str} onChange={e => setStr(e.target.value)} placeholder="Escribe texto" style={{marginRight: '0.5rem'}} />
      <button onClick={checkCase}>Verificar</button>
      {res && <p><strong>{res}</strong></p>}
    </div>
  );
}

export default Ejercicio4
