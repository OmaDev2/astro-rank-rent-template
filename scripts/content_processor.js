import JSON5 from 'json5';

// Palabras prohibidas que delatan a la IA
const FORBIDDEN_WORDS = [
    'vibrante', 'tapiz', 'sinfonía', 'inigualable', 'meticuloso',
    'resiliencia', 'crisol', 'juego de', 'emblemático', 'pionero',
    'vanguardia', 'destacar', 'cautivador', 'sumérgete'
];

/**
 * Valida que el contenido no tenga palabras prohibidas.
 * @param {object} data - Objeto JSON con el contenido.
 * @returns {object} { valid: boolean, warnings: [] }
 */
export function validateContent(data) {
    const warnings = [];
    const checkString = (str, path) => {
        if (!str) return;
        const lower = str.toLowerCase();
        FORBIDDEN_WORDS.forEach(word => {
            if (lower.includes(word)) {
                warnings.push(`⚠️ Palabra prohibida detectada en ${path}: "${word}"`);
            }
        });
    };

    // Recorremos recursivamente el objeto
    function traverse(obj, path = '') {
        if (typeof obj === 'string') {
            checkString(obj, path);
        } else if (Array.isArray(obj)) {
            obj.forEach((item, i) => traverse(item, `${path}[${i}]`));
        } else if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                traverse(value, `${path}.${key}`);
            }
        }
    }

    traverse(data, 'root');
    return { valid: warnings.length === 0, warnings };
}

/**
 * Inyecta enlaces internos en textos planos.
 * @param {object} data - Objeto de contenido.
 * @param {Array} linksMap - Array de { keyword: string, url: string }.
 * @returns {object} Data modificada con enlaces MDX.
 */
export function injectInternalLinks(data, linksMap) {
    // Ordenamos keywords por longitud (de mayor a menor) para evitar romper enlaces parciales
    const sortedLinks = [...linksMap].sort((a, b) => b.keyword.length - a.keyword.length);

    // Set para trackear qué links ya hemos puesto (solo 1 por página para no spammear)
    const usedLinks = new Set();

    function processText(text) {
        let newText = text;
        for (const { keyword, url } of sortedLinks) {
            if (usedLinks.has(url)) continue; // Ya enlazamos esto

            // Regex: palabra completa, case insensitive, no dentro de un link existente
            // Lookbehind es complejo en JS antiguo, usaremos boundary simple
            const regex = new RegExp(`(^|\\s)(${keyword})(?=\\s|\\.|,|$)`, 'i');

            if (regex.test(newText)) {
                newText = newText.replace(regex, `$1[$2](${url})`);
                usedLinks.add(url);
            }
        }
        return newText;
    }

    function traverse(obj) {
        if (typeof obj === 'string') {
            // Solo procesamos strings largos (descripciones), no títulos cortos
            if (obj.length > 50) return processText(obj);
            return obj;
        } else if (Array.isArray(obj)) {
            return obj.map(item => traverse(item));
        } else if (typeof obj === 'object' && obj !== null) {
            const newObj = {};
            for (const [key, value] of Object.entries(obj)) {
                // Evitamos procesar campos que no son texto visible (ids, urls, imagenes)
                if (['image', 'link', 'url', 'slug', 'id'].includes(key)) {
                    newObj[key] = value;
                } else {
                    newObj[key] = traverse(value);
                }
            }
            return newObj;
        }
        return obj;
    }

    return traverse(data);
}
