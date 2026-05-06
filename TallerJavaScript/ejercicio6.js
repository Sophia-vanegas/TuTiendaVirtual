let celular = prompt("Ingrese su número de celular:");

// Expresión regular para validar si son exactamente 10 dígitos (formato estándar de muchos países)
let regexCelular = /^\d{10}$/;

if (celular) {
    if (regexCelular.test(celular)) {
        alert("El número de celular '" + celular + "' es VÁLIDO.");
    } else {
        alert("El número de celular '" + celular + "' es INVÁLIDO. Asegúrese de ingresar exactamente 10 dígitos numéricos.");
    }
} else {
    alert("No se ingresó ningún número.");
}
