import { useState } from 'react'

function Ejercicio3() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const calculate = () => {
    const n = parseInt(input);
    if (isNaN(n) || n < 0) {
      setResult('Número entero ≥ 0.');
      return;
    }
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    setResult(`!${n} = ${f}`);
  };

  return (
    <div className="card">
      <h2>3. Calcular Factorial</h2>
      <input type="number" value={input} onChange={e => setInput(e.target.value)} placeholder="Número (ej: 5)" style={{marginRight: '0.5rem'}} />
      <button onClick={calculate}>Calcular</button>
      {result && <p><strong>{result}</strong></p>}
    </div>
  );
}

export default Ejercicio3
