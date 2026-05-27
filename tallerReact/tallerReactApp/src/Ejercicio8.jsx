import { useState } from 'react'

function Ejercicio8() {
  const [url, setUrl] = useState('https://www.google.com');

  const openNewWindow = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>8. Abrir Nueva Ventana</h2>
      <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="URL" style={{marginRight: '0.5rem', width: '300px'}} />
      <button onClick={openNewWindow}>Abrir</button>
    </div>
  );
}

export default Ejercicio8
