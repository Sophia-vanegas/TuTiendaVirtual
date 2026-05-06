import { useState } from 'react'

function Ejercicio5() {
  const [phrase, setPhrase] = useState('');
  const [isPal, setIsPal] = useState(false);

  const checkPalindrome = () => {
    const clean = phrase.toLowerCase().replace(/[^a-z0-9]/g, '');
    setIsPal(clean === clean.split('').reverse().join(''));
  };

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h2>5. Palíndromo</h2>
      <input type="text" value={phrase} onChange={e => setPhrase(e.target.value)} placeholder="Ej: radar" style={{marginRight: '0.5rem'}} />
      <button onClick={checkPalindrome}>Verificar</button>
      {isPal !== null && <p><strong>{isPal ? 'Sí es palíndromo' : 'No es palíndromo'}</strong></p>}
    </div>
  );
}

export default Ejercicio5
