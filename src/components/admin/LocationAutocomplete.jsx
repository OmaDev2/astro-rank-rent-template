import React, { useState, useEffect } from 'react';

/**
 * Componente de ejemplo para autocompletar ubicaciones
 * Usa el endpoint /api/locations para buscar ubicaciones de DataForSEO
 */
export default function LocationAutocomplete({ onLocationSelect, defaultValue = '' }) {
    const [query, setQuery] = useState(defaultValue);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Buscar ubicaciones cuando el usuario escribe
    useEffect(() => {
        const searchLocations = async () => {
            if (query.length < 3) {
                setLocations([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setLocations(data);
                setShowDropdown(true);
            } catch (error) {
                console.error('Error buscando ubicaciones:', error);
                setLocations([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce: esperar 300ms después de que el usuario deje de escribir
        const timeoutId = setTimeout(searchLocations, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (location) => {
        setSelectedLocation(location);
        setQuery(location.name);
        setShowDropdown(false);

        // Llamar al callback con el código de ubicación
        if (onLocationSelect) {
            onLocationSelect(location.code, location.name);
        }
    };

    // Actualizar el callback cuando el usuario escribe (sin seleccionar del dropdown)
    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Si el usuario borra la selección, resetear
        if (value === '') {
            setSelectedLocation(null);
            if (onLocationSelect) {
                onLocationSelect(null, '');
            }
        } else if (value.length >= 3) {
            // Actualizar con el valor escrito (aunque no haya seleccionado del dropdown)
            if (onLocationSelect) {
                onLocationSelect(null, value);
            }
        }
    };

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-2">
                Ciudad <span className="text-red-400">*</span>
            </label>

            {/* Info tooltip */}
            <div className="mb-3 bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-xs text-blue-200">
                <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">ℹ️</span>
                    <div>
                        <p className="font-medium text-blue-100 mb-1">¿Cómo funciona la ubicación?</p>
                        <ul className="space-y-1 text-blue-200/80">
                            <li>• <strong>Con ciudad:</strong> Búsqueda de competidores específicos de esa ciudad</li>
                            <li>• <strong>Sin ciudad:</strong> Búsqueda más amplia a nivel de España</li>
                        </ul>
                        <p className="mt-2 text-blue-300/60 italic text-[10px]">
                            Nota: La API de keywords solo acepta países, no ciudades específicas
                        </p>
                    </div>
                </div>
            </div>

            <input
                type="text"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                placeholder="Escribe una ciudad (ej: Barcelona)"
                value={query}
                onChange={handleInputChange}
                onFocus={() => locations.length > 0 && setShowDropdown(true)}
                required
            />

            {/* Dropdown de resultados */}
            {showDropdown && locations.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {locations.map((loc) => (
                        <button
                            key={loc.code}
                            type="button"
                            onClick={() => handleSelect(loc)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-white font-medium">{loc.name}</div>
                                    <div className="text-xs text-slate-400">{loc.type}</div>
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                    {loc.code}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Indicador de carga */}
            {isLoading && (
                <div className="absolute right-3 top-11 text-slate-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {/* Mostrar ubicación seleccionada */}
            {selectedLocation && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-700/30 rounded text-xs">
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span className="font-medium">Seleccionado:</span>
                        <span className="font-mono">{selectedLocation.name}</span>
                        <span className="text-green-500/60">(Code: {selectedLocation.code})</span>
                    </div>
                    <div className="mt-1 text-green-300/60 text-[10px]">
                        → Competidores: búsqueda específica de {selectedLocation.name} | Keywords: nivel España
                    </div>
                </div>
            )}

            {/* Mostrar cuando hay texto pero no selección del dropdown */}
            {!selectedLocation && query.length > 0 && (
                <div className="mt-2 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-200">
                    <div className="flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Usando "{query}" como ciudad (puedes seleccionar del dropdown para mayor precisión)</span>
                    </div>
                </div>
            )}
        </div>
    );
}
