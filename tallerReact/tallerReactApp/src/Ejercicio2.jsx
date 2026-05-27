import { useState } from 'react'

function Ejercicio2() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [num3, setNum3] = useState('');
  const [result, setResult] = useState('');

  const compareNumbers = () => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);
    const n3 = parseFloat(num3);
    const numbers = [n1, n2, n3].filter(n => !isNaN(n));
    if (numbers.length !== 3) {
      setResult('Por favor ingresa tres números válidos.');
      return;
    }
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    const negatives = numbers.filter(n => n < 0);
    setResult(`Mayor: ${max}, Menor: ${min}, Negativos: ${negatives.length > 0 ? negatives.join(', ') : 'Ninguno'}`);
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>2. Comparar Tres Números</h2>
      <input type="number" value={num1} onChange={(e) => setNum1(e.target.value)} placeholder="Número 1" style={{ marginRight: '0.5rem' }} />
      <input type="number" value={num2} onChange={(e) => setNum2(e.target.value)} placeholder="Número 2" style={{ marginRight: '0.5rem' }} />
      <input type="number" value={num3} onChange={(e) => setNum3(e.target.value)} placeholder="Número 3" style={{ marginRight: '0.5rem' }} />
      <button onClick={compareNumbers}>Comparar</button>
      {result && <p><strong>{result}</strong></p>}
    </div>
  )
}

export default Ejercicio2
