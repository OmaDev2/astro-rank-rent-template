/**
 * Procesa texto con formato Spintax {opcion1|opcion2} de forma recursiva.
 * Soporta anidamiento: {Hola|{Qué tal|Saludos}}
 * 
 * @param text Texto con formato Spintax
 * @returns Texto con las variaciones resueltas aleatoriamente
 */
export function spin(text: string): string {
    if (!text || typeof text !== 'string') return text;

    // Regex para encontrar el patrón más interno {a|b|c}
    // [^{}]+ asegura que no haya llaves dentro, garantizando que es el nivel más profundo
    const regex = /\{([^{}]+)\}/g;

    let processedText = text;

    // Mientras sigan quedando patrones {..} en el texto
    while (regex.test(processedText)) {
        processedText = processedText.replace(regex, (match, content) => {
            const options = content.split('|');
            // Elegir una opción aleatoria
            return options[Math.floor(Math.random() * options.length)];
        });
    }

    return processedText;
}
