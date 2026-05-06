import { useState } from 'react'

function Ejercicio6() {
  const [date, setDate] = useState('');

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>6. Selector Fecha</h2>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      {date && <p><strong>Fecha: {new Date(date).toLocaleDateString('es-ES')}</strong></p>}
    </div>
  );
}

export default Ejercicio6
