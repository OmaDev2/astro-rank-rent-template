import { useState, useEffect } from 'react';

interface Props {
  businessName: string;
  niche: string;
  city: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface Result {
  content: string;
  fileName: string;
  slug: string;
  writtenToDisk: boolean;
}

const SESSION_KEY = 'generadorIA_lastResult';

export default function GeneradorIA({ businessName, niche, city }: Props) {
  const [zoneName, setZoneName] = useState('');
  const [type, setType] = useState('residencial');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Recuperar resultado tras HMR (Astro recarga el componente al detectar nuevo archivo)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        setResult(JSON.parse(saved));
        setStatus('success');
      }
    } catch { /* ignorar */ }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generar-zona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneName, type, notes, businessName, niche, city }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? 'Error en la generación');
      }

      setResult(data);
      setStatus('success');
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch { /* ignorar */ }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setStatus('idle');
    setZoneName('');
    setNotes('');
    setResult(null);
    setError('');
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignorar */ }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Generador de Zonas con IA</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="inline-flex gap-3">
            <span>🏢 <strong>{businessName}</strong></span>
            <span>🔧 {niche}</span>
            <span>📍 {city}</span>
          </span>
        </p>
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Solo disponible en desarrollo local. El archivo se guarda en <code>src/content/locations/</code>
        </div>
      </div>

      {status !== 'success' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="zoneName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la zona *
            </label>
            <input
              id="zoneName"
              type="text"
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
              placeholder="Ej: Alcobendas, Pozuelo de Alarcón, Getafe..."
              required
              disabled={status === 'loading'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Tipo de zona</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="residencial"
                  checked={type === 'residencial'}
                  onChange={() => setType('residencial')}
                  disabled={status === 'loading'}
                />
                <span>
                  <strong>Residencial</strong>
                  <span className="text-gray-500"> — básico, secundaria</span>
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  value="centro"
                  checked={type === 'centro'}
                  onChange={() => setType('centro')}
                  disabled={status === 'loading'}
                />
                <span>
                  <strong>Centro</strong>
                  <span className="text-gray-500"> — completa, principal</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales{' '}
              <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: zona de edificios años 60, alta densidad, cerca del aeropuerto..."
              rows={2}
              disabled={status === 'loading'}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Cuantos más detalles des, más específico y valioso será el contenido generado.
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generando con Gemini...
              </span>
            ) : (
              '✨ Generar zona con IA'
            )}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setStatus('idle')}
            className="block mt-2 text-xs underline hover:no-underline"
          >
            Volver a intentarlo
          </button>
        </div>
      )}

      {status === 'success' && result && (
        <div>
          <div className="flex items-start justify-between mb-3 gap-4">
            <div>
              {result.writtenToDisk ? (
                <p className="text-green-700 text-sm font-medium">
                  ✅ Guardado en{' '}
                  <code className="bg-green-50 px-1 rounded">
                    src/content/locations/{result.fileName}
                  </code>
                </p>
              ) : (
                <p className="text-amber-700 text-sm font-medium">
                  ⚠️ No se pudo guardar automáticamente. Descarga o copia el archivo.
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Slug: <code>{result.slug}</code> · URL: <code>/zona/{result.slug}/</code>
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                {copied ? '✅ Copiado' : '📋 Copiar'}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
              >
                ⬇️ Descargar
              </button>
            </div>
          </div>

          <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs overflow-auto max-h-96 whitespace-pre-wrap text-gray-800 leading-relaxed">
            {result.content}
          </pre>

          <button
            onClick={handleReset}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            ← Generar otra zona
          </button>
        </div>
      )}
    </div>
  );
}
