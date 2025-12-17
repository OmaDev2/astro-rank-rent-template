import { spin } from '../src/utils/spintax';

console.log("🧪 Iniciando Tests de Spintax...\n");

const tests = [
    { name: "Texto simple", input: "Hola Mundo" },
    { name: "Spintax básico", input: "{Hola|Saludos|Buenas} Mundo" },
    { name: "Spintax anidado", input: "{Hola|{Qué tal|Cómo estás}} amigo" },
    { name: "Múltiples bloques", input: "{El|Un} {coche|auto} {rápido|veloz}" },
    { name: "Opción vacía", input: "Hola {|amigo}" }
];

tests.forEach(test => {
    console.log(`--- ${test.name} ---`);
    console.log(`Input: "${test.input}"`);
    console.log("Resultados (3 intentos):");
    for (let i = 0; i < 3; i++) {
        console.log(`   Attempt ${i + 1}: "${spin(test.input)}"`);
    }
    console.log("");
});
