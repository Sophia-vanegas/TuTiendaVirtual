let num1 = parseFloat(prompt("Ingrese el primer número:"));
let num2 = parseFloat(prompt("Ingrese el segundo número:"));
let num3 = parseFloat(prompt("Ingrese el tercer número:"));

if (!isNaN(num1) && !isNaN(num2) && !isNaN(num3)) {
    let mayor = Math.max(num1, num2, num3);
    let menor = Math.min(num1, num2, num3);

    let negativos = [];
    if (num1 < 0) negativos.push(num1);
    if (num2 < 0) negativos.push(num2);
    if (num3 < 0) negativos.push(num3);

    let mensaje = "El número mayor es: " + mayor + "\n" +
        "El número menor es: " + menor + "\n";

    if (negativos.length > 0) {
        mensaje += "Los números negativos son: " + negativos.join(", ");
    } else {
        mensaje += "No hay números negativos.";
    }

    alert(mensaje);
} else {
    alert("Por favor, ingrese números válidos.");
}
