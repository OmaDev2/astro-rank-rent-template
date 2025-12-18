import React, { useState } from 'react';
import { Bot, Copy, RefreshCw, Send, CheckCircle2, Sparkles, FileText, HelpCircle, Star, Layout } from 'lucide-react';

const GENERATION_TYPES = [
    {
        category: 'SEO & Meta', items: [
            { id: 'seoTitle', label: 'SEO Title', icon: Sparkles, description: 'Título optimizado para buscadores (60 caracteres)' },
            { id: 'seoDesc', label: 'Meta Description', icon: Sparkles, description: 'Resumen persuasivo para Google (155 caracteres)' },
        ]
    },
    {
        category: 'Hero & Cabecera', items: [
            { id: 'heroHeading', label: 'H1: Título Principal', icon: Layout, description: 'Título impactante para la cabecera' },
            { id: 'heroSubheading', label: 'H1: Subtítulo', icon: Layout, description: 'Refuerzo de autoridad local' },
            { id: 'headingHighlight', label: 'Palabra Destacada', icon: Sparkles, description: 'Frase corta (2-3 palabras) para resaltar' },
        ]
    },
    {
        category: 'Contenido Informativo', items: [
            { id: 'aboutTitle', label: 'Título Sobre Nosotros', icon: FileText, description: 'Título creativo para la sección' },
            { id: 'aboutDescription', label: 'Texto Sobre Nosotros', icon: FileText, description: 'Biografía detallada del negocio' },
            { id: 'shortDesc', label: 'Descripción Corta', icon: FileText, description: 'Ideal para listados o pie de página' },
        ]
    },
    {
        category: 'Secciones & Listas', items: [
            { id: 'servicesTitle', label: 'Título de Servicios', icon: FileText, description: 'Encabezado para la sección servicios' },
            { id: 'servicesSubtitle', label: 'Subtítulo de Servicios', icon: FileText, description: 'Introducción a la cuadrícula' },
            { id: 'featuresTitle', label: 'Título de Características', icon: FileText, description: 'Por qué elegirnos' },
            { id: 'processTitle', label: 'Título de Proceso', icon: FileText, description: 'Cómo trabajamos' },
            { id: 'faqArray', label: 'Preguntas Frecuentes', icon: HelpCircle, description: '5 FAQs en formato JSON para el CMS' },
            { id: 'featuresArray', label: '¿Por qué elegirnos?', icon: CheckCircle2, description: '3 beneficios clave con iconos Lucide' },
            { id: 'stepsArray', label: 'Nuestro Proceso', icon: RefreshCw, description: '3 pasos de trabajo en JSON' },
            { id: 'testimonialsArray', label: 'Testimonios', icon: Star, description: '3 opiniones realistas en JSON' },
        ]
    },
    {
        category: 'Conversión', items: [
            { id: 'ctaTitle', label: 'Título CTA', icon: Send, description: 'Llamada a la acción urgente' },
            { id: 'ctaSubtitle', label: 'Subtítulo CTA', icon: Send, description: 'Elimina fricciones (Ej: Presupuesto Gratis)' },
        ]
    },
];

export default function AIContentAssistant({ initialData = {} }) {
    const [field, setField] = useState('heroHeading');
    const [niche, setNiche] = useState(initialData.niche || '');
    const [city, setCity] = useState(initialData.city || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!niche || !city) {
            alert('Por favor, indica el nicho y la ciudad.');
            return;
        }

        setLoading(true);
        setResult(null);
        try {
            // Detectar si el campo requiere JSON
            const format = field.toLowerCase().includes('array') ? 'json' : 'text';

            const res = await fetch('/api/generate_single', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, niche, city, format })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data.content);
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const text = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Asistente de Contenidos IA</h3>
                    <p className="text-slate-400 text-sm">Genera inspiración para bloques específicos de tu web</p>
                </div>
            </div>

            <div className="p-6 grid lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nicho</label>
                            <input
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={niche}
                                onChange={e => setNiche(e.target.value)}
                                placeholder="Ej: Fontanero"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ciudad</label>
                            <input
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder="Ej: Madrid"
                            />
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {GENERATION_TYPES.map(cat => (
                            <div key={cat.category}>
                                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 px-1">{cat.category}</h4>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {cat.items.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setField(type.id)}
                                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left group ${field === type.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            <div className={`p-1.5 rounded-md ${field === type.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                                                <type.icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs">{type.label}</div>
                                                <div className={`text-[10px] ${field === type.id ? 'text-indigo-100' : 'text-slate-500'}`}>{type.description}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                    >
                        {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        {loading ? 'Generando...' : 'Generar con IA'}
                    </button>
                </div>

                {/* Resultado */}
                <div className="flex flex-col h-full min-h-[450px]">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Resultado Generado</label>
                        {result && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-400/10 px-2 py-1 rounded"
                            >
                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado' : 'Copiar Resultado'}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 bg-slate-900/80 rounded-xl border border-slate-700/50 p-5 font-mono text-sm overflow-auto relative group shadow-inner">
                        {!result && !loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 text-center p-8">
                                <div className="bg-slate-800/50 p-4 rounded-full mb-4">
                                    <Sparkles className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm max-w-[250px]">Selecciona un campo y pulsa "Generar" para obtener contenidos optimizados.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-[2px] z-10">
                                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                <span className="text-xs text-slate-400 font-bold animate-pulse">Consultando a Gemini...</span>
                            </div>
                        )}
                        {result && (
                            <div className="text-slate-200 whitespace-pre-wrap animate-fade-in">
                                {typeof result === 'string' ? (
                                    <span className="leading-relaxed">{result}</span>
                                ) : (
                                    <pre className="text-indigo-300 text-xs leading-5">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/20 rounded-lg">
                        <p className="text-[10px] text-indigo-300/80 italic flex items-start gap-2">
                            <Bot className="w-3 h-3 mt-0.5" />
                            <span><strong>Tip:</strong> Copia el resultado y úsalo en Keystatic. Los bloques de "Array" están listos para ser pegados en campos de tipo lista/objeto.</span>
                        </p>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 4px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: rgba(15, 23, 42, 0.1);
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(99, 102, 241, 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(99, 102, 241, 0.5);
                    }
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.4s ease-out forwards;
                    }
                ` }} />
            </div>
        </div>
    );
}
