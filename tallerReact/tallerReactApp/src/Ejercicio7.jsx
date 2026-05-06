import { useState } from 'react'

function Ejercicio7() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [op, setOp] = useState('suma');
  const [res, setRes] = useState('');

  const calculate = () => {
    let n1 = parseFloat(a);
    let n2 = parseFloat(b);
    if (isNaN(n1) || isNaN(n2)) {
      setRes('Números inválidos');
      return;
    }
    let r;
    switch (op) {
      case 'suma': r = n1 + n2; break;
      case 'resta': r = n1 - n2; break;
      case 'multi': r = n1 * n2; break;
      case 'div': r = n2 !== 0 ? n1 / n2 : 'Div 0!'; break;
      case 'pot': r = Math.pow(n1, n2); break;
      case 'rad': r = n1 >= 0 ? Math.sqrt(n1) : 'Rad negativo'; break;
      case 'log': r = n1 > 0 && n2 > 0 ? Math.log(n1)/Math.log(n2) : 'Log inválido'; break;
      default: r = 'Op inválida';
    }
    setRes(isNaN(r) || r === 'Div 0!' || r === 'Rad negativo' || r === 'Log inválido' ? r : r.toFixed(4));
  };

  return (
    <div className="card">
      <h2>7. Calculadora</h2>
      <input type="number" value={a} onChange={e => setA(e.target.value)} placeholder="Num1" style={{marginRight: '0.5rem'}} />
      <input type="number" value={b} onChange={e => setB(e.target.value)} placeholder="Num2" style={{marginRight: '0.5rem'}} />
      <select value={op} onChange={e => setOp(e.target.value)} style={{marginRight: '0.5rem'}}>
        <option value="suma">Suma</option>
        <option value="resta">Resta</option>
        <option value="multi">Multi</option>
        <option value="div">Div</option>
        <option value="pot">Potencia</option>
        <option value="rad">Raíz (n1)</option>
        <option value="log">Log n1 base n2</option>
      </select>
      <button onClick={calculate}>Calcular</button>
      {res && <p><strong>{res}</strong></p>}
    </div>
  );
}

export default Ejercicio7
