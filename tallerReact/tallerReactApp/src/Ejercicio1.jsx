import { useState } from 'react'

function Ejercicio1() {
  const [count, setCount] = useState(0);

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>1. Contador de Clics</h2>
      <p>Contador: <strong>{count}</strong></p>
      <button onClick={() => setCount(count + 1)}>
        Incrementar
      </button>
      <button onClick={() => setCount(0)} style={{ marginLeft: '1rem' }}>
        Reiniciar
      </button>
    </div>
  )
}

export default Ejercicio1
