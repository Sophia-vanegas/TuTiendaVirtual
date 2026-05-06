let numStr = prompt("Ingrese un número entero positivo para calcular su factorial:");
let numero = parseInt(numStr);

if (!isNaN(numero) && numero >= 0) {
    let factorial = 1;
    for (let i = 1; i <= numero; i++) {
        factorial *= i;
    }
    alert("El factorial de " + numero + " es: " + factorial);
} else {
    alert("Por favor, ingrese un número entero mayor o igual a cero válido.");
}
