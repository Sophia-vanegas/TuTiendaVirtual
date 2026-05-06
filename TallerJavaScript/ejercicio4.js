var valores = [true, 5, false, "hola", "adios", 2];

// 4.1 Determinar cual de los dos elementos de texto es mayor
var texto1 = valores[3]; // "hola"
var texto2 = valores[4]; // "adios"
var mayor = texto1 > texto2 ? texto1 : texto2;

// 4.2 y 4.3 Operaciones con booleanos
var bool1 = valores[0]; // true
var bool2 = valores[2]; // false

var resultadoOR = bool1 || bool2;
var resultadoAND = bool1 && bool2;

// 4.4 a 4.8 Operaciones matemáticas
var num1 = valores[1]; // 5
var num2 = valores[5]; // 2

var suma = num1 + num2;
var resta = num1 - num2;
var multiplicacion = num1 * num2;
var division = num1 / num2;
var modulo = num1 % num2;

var resultado = "4.1. La cadena mayor es: " + mayor + "\n" +
                "4.2. Resultado OR (true || false): " + resultadoOR + "\n" +
                "4.3. Resultado AND (true && false): " + resultadoAND + "\n" +
                "4.4. Suma (5 + 2): " + suma + "\n" +
                "4.5. Resta (5 - 2): " + resta + "\n" +
                "4.6. Multiplicación (5 * 2): " + multiplicacion + "\n" +
                "4.7. División (5 / 2): " + division + "\n" +
                "4.8. Residuo (5 % 2): " + modulo;

alert(resultado);
