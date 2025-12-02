import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check, Loader2, Database, Globe, AlertTriangle, ArrowLeftRight, ChevronRight, Settings, List, Eye, Cloud, Bot, Trash2, Save, Plus, X } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';

export default function GeneratorApp() {
    const [step, setStep] = useState('input'); // input | loading | selection | review | generating | success
    const [formData, setFormData] = useState({
        niche: '',
        city: '',
        locationCode: null,
        locationName: null,
        searchEngine: 'google.es',
        searchLocation: 'Spain',
        seedKeyword: '',
        top10Filter: true,
        generateLocations: false // NUEVO: Toggle para generar páginas de localidades
    });
    const [researchData, setResearchData] = useState(null);
    const [selectedCompetitors, setSelectedCompetitors] = useState(new Set());
    const [logs, setLogs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Auto-update seed keyword
    useEffect(() => {
        if (formData.niche && formData.city) {
            setFormData(prev => ({
                ...prev,
                seedKeyword: `${prev.niche} ${prev.city}`
            }));
        }
    }, [formData.niche, formData.city]);

    const handleResearch = async (e) => {
        e.preventDefault();
        setStep('loading');
        setLogs(["🚀 Buscando competidores locales en Google..."]);

        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche: formData.niche,
                    city: formData.city,
                    location: formData.locationName || formData.city.toLowerCase()
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResearchData(data);
            if (data.raw_data?.competitors) {
                const allDomains = new Set(data.raw_data.competitors.map(c => c.domain));
                setSelectedCompetitors(allDomains);
            }
            setStep('selection');
        } catch (err) {
            alert(err.message);
            setStep('input');
        }
    };

    const handleFinishSelection = async () => {
        setStep('loading');
        setLogs([
            "🕵️ Extrayendo keywords de competidores locales...",
            "🎯 Filtrando por relevancia local...",
            "🧠 IA realizando Clustering inteligente...",
            "✨ Optimizando Meta Tags para SEO local..."
        ]);

        try {
            const selectedDomainsArray = Array.from(selectedCompetitors);
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche: formData.niche,
                    city: formData.city,
                    competitors: selectedDomainsArray,
                    location: formData.locationName || formData.city.toLowerCase(),
                    top10Filter: formData.top10Filter !== false
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Asegurar estructura para edición
            if (!data.home_structure) data.home_structure = { h1: '', h2s: [] };

            setResearchData(data);
            setStep('review');

        } catch (err) {
            alert(err.message);
            setStep('selection');
        }
    };

    // NUEVO: Guardar plan antes de generar
    const handleSavePlan = async () => {
        setSaving(true);
        try {
            const planToSave = {
                ...researchData,
                generate_locations: formData.generateLocations // Pasamos la config al plan
            };

            const res = await fetch('/api/save_plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planToSave)
            });
            const result = await res.json();
            if (!result.success) throw new Error(result.error);
            return true;
        } catch (err) {
            alert("Error guardando el plan: " + err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        setShowConfirmModal(false);

        // Primero guardamos el plan modificado
        const saved = await handleSavePlan();
        if (!saved) return;

        setStep('generating');
        setLogs([
            "📋 Plan guardado correctamente",
            "🏗️ Construyendo sitio web...",
            "📝 Generando contenido con IA...",
            "🎨 Aplicando diseño artesano..."
        ]);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify(researchData)
            });
            const result = await res.json();
            if (result.success) setStep('success');
            else throw new Error(result.error);
        } catch (err) {
            alert("Error generando: " + err.message);
            setStep('review');
        }
    };

    // Calcular totales para el modal de confirmación
    const calculateTotals = () => {
        if (!researchData?.clusters) return { clusters: 0, keywords: 0, pages: 0 };
        const clusters = researchData.clusters.length;
        const keywords = researchData.clusters.reduce((sum, c) => sum + (c.keywords?.length || 0), 0);
        const pages = clusters + 1 + (formData.generateLocations ? (researchData.locations?.length || 0) : 0);
        return { clusters, keywords, pages };
    };

    // --- FUNCIONES DE GESTIÓN DE CLUSTERS ---

    const handleDeleteCluster = (index) => {
        if (confirm('¿Estás seguro de eliminar este cluster completo?')) {
            const newClusters = [...researchData.clusters];
            newClusters.splice(index, 1);
            setResearchData({ ...researchData, clusters: newClusters });
        }
    };

    const handleAddCluster = () => {
        const name = prompt("Nombre del nuevo servicio/cluster:");
        if (name) {
            const newClusters = [...(researchData.clusters || [])];
            newClusters.push({
                name: name,
                intent: "COMMERCIAL",
                main_keyword: name.toLowerCase(),
                volume: 0,
                keywords: [],
                meta_suggestions: [{
                    h1: name,
                    seo_title: `${name} en ${formData.city}`,
                    seo_description: `Servicio profesional de ${name} en ${formData.city}.`
                }]
            });
            setResearchData({ ...researchData, clusters: newClusters });
        }
    };

    const Stepper = ({ currentStep }) => {
        const steps = [
            { id: 1, name: 'Location', key: 'input' },
            { id: 2, name: 'Services', key: 'selection' },
            { id: 3, name: 'Strategy', key: 'review' }
        ];

        return (
            <div className="flex items-center justify-between mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                {steps.map((s, idx) => {
                    const isActive = currentStep === s.key;
                    let isCompleted = false;
                    if (currentStep === 'selection' && idx < 1) isCompleted = true;
                    if (currentStep === 'review' && idx < 2) isCompleted = true;
                    if (currentStep === 'success') isCompleted = true;

                    return (
                        <div key={s.id} className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${isActive || isCompleted ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>
                            <span className="font-bold mr-2 text-lg">{s.id}</span>
                            <span className="font-medium">{s.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- VISTAS ---

    if (step === 'input') {
        return (
            <div className="max-w-4xl mx-auto text-white">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-indigo-400 mb-2 flex items-center justify-center gap-2">
                        AI Wizard by <span className="text-white">Agent X</span>
                    </h2>
                </div>
                <Stepper currentStep={step} />
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
                    <form onSubmit={handleResearch} className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Enter a <span className="text-white font-bold underline decoration-indigo-500">Keyword</span> that best describes your Business
                            </label>
                            <input className="w-full bg-slate-900 border border-slate-700 rounded-lg py-4 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-lg placeholder-slate-600" placeholder="e.g. Parquetista" value={formData.niche} onChange={e => setFormData({ ...formData, niche: e.target.value })} required />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Search Engine</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4" value={formData.searchEngine} onChange={e => setFormData({ ...formData, searchEngine: e.target.value })}>
                                    <option value="google.com">google.com (US)</option>
                                    <option value="google.es">google.es (Spain)</option>
                                </select>
                            </div>
                            <div>
                                <LocationAutocomplete
                                    onLocationSelect={(code, name) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            city: name,
                                            locationCode: code,
                                            locationName: name
                                        }));
                                    }}
                                    defaultValue={formData.city}
                                />
                            </div>
                        </div>

                        {/* TOP 10 Filter Toggle */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <div className="text-sm font-medium text-slate-200">
                                        🎯 Filter TOP 10 Positions Only
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Extract only keywords where competitors rank in positions 1-10 (higher quality)
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.top10Filter}
                                        onChange={(e) => setFormData({ ...formData, top10Filter: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                        </div>

                        {/* Generate Locations Toggle */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <div className="text-sm font-medium text-slate-200">
                                        🌍 Generate Location Pages (Barrios)
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        Create individual landing pages for each neighborhood/district (Optional)
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={formData.generateLocations}
                                        onChange={(e) => setFormData({ ...formData, generateLocations: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                        </div>

                        <button type="submit" className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2">
                            Continue <ChevronRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (step === 'loading' || step === 'generating') {
        const progressSteps = step === 'loading' ? [
            { icon: '🔍', text: 'Buscando competidores en Google...', done: logs.length > 0 },
            { icon: '📊', text: 'Extrayendo keywords de competidores...', done: logs.length > 1 },
            { icon: '🎯', text: 'Filtrando por relevancia local...', done: logs.length > 2 },
            { icon: '🧠', text: 'IA realizando Clustering inteligente...', done: logs.length > 3 },
            { icon: '✨', text: 'Optimizando Meta Tags para SEO...', done: logs.length > 4 }
        ] : [
            { icon: '📋', text: 'Plan guardado correctamente', done: true },
            { icon: '🏗️', text: 'Construyendo sitio web...', done: logs.length > 1 },
            { icon: '📝', text: 'Generando contenido con IA...', done: logs.length > 2 },
            { icon: '🎨', text: 'Aplicando diseño artesano...', done: logs.length > 3 }
        ];

        return (
            <div className="max-w-4xl mx-auto text-white py-20">
                <div className="text-center mb-8">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-indigo-500" />
                    <h3 className="text-2xl font-bold mb-2">
                        {step === 'loading' ? 'Analizando Datos...' : 'Construyendo Web...'}
                    </h3>
                    <p className="text-slate-400 text-sm">Por favor espera mientras procesamos tu solicitud</p>
                </div>

                {/* Progress Steps */}
                <div className="max-w-md mx-auto bg-slate-900 rounded-lg border border-slate-800 overflow-hidden mb-6">
                    {progressSteps.map((stepItem, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-3 p-4 border-b border-slate-800 last:border-b-0 transition-all ${stepItem.done ? 'bg-slate-800/50' : 'bg-slate-900'
                                }`}
                        >
                            <span className="text-2xl">{stepItem.icon}</span>
                            <span className={`flex-1 text-sm ${stepItem.done ? 'text-green-400' : 'text-slate-500'}`}>
                                {stepItem.text}
                            </span>
                            {stepItem.done && (
                                <Check className="w-5 h-5 text-green-400" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Log Console */}
                <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-lg text-left font-mono text-xs text-green-400 h-32 overflow-y-auto border border-slate-800">
                    {logs.map((l, i) => (
                        <div key={i} className="mb-1 animate-fade-in">{l}</div>
                    ))}
                    <div className="animate-pulse">▊</div>
                </div>
            </div>
        );
    }

    if (step === 'selection' && researchData) {
        return (
            <div className="max-w-4xl mx-auto text-white">
                <Stepper currentStep="selection" />
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                            <span className="text-slate-400">Target:</span> <span className="text-white font-bold">{formData.niche} in {formData.city}</span>
                        </div>
                        <button onClick={() => {
                            if (researchData.raw_data?.competitors) {
                                const all = new Set(researchData.raw_data.competitors.map(c => c.domain));
                                setSelectedCompetitors(all);
                            }
                        }} className="bg-indigo-900 text-indigo-200 px-4 py-2 rounded text-sm font-bold hover:bg-indigo-800">
                            Select All Recommended
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {researchData.raw_data?.competitors?.map((comp, idx) => (
                            <div key={idx} className="bg-white text-slate-900 p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-slate-500">{comp.url}</div>
                                    <h3 className="font-bold text-indigo-900">{comp.title}</h3>
                                </div>
                                <input
                                    type="checkbox"
                                    className="w-6 h-6 text-indigo-600 rounded border-slate-300 cursor-pointer"
                                    checked={selectedCompetitors.has(comp.domain)}
                                    onChange={(e) => {
                                        const newSet = new Set(selectedCompetitors);
                                        if (e.target.checked) newSet.add(comp.domain);
                                        else newSet.delete(comp.domain);
                                        setSelectedCompetitors(newSet);
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-slate-700">
                        <button onClick={handleFinishSelection} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                            <Check className="w-5 h-5" /> Finish & Analyze
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA DE REVISIÓN (STRATEGY)
    if (step === 'review' && researchData) {
        const topKeywords = researchData.raw_data?.top_keywords || [];
        const clusters = researchData.clusters || [];

        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-200 p-4">
                <Stepper currentStep="review" />

                {/* Header Actions */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center sticky top-2 z-50 shadow-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Estrategia SEO Generada</h2>
                        <p className="text-xs text-slate-400">{researchData.market_analysis?.substring(0, 100)}...</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={handleSavePlan} disabled={saving} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Plan
                        </button>
                        <button onClick={() => setShowConfirmModal(true)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                            <Check className="w-5 h-5" /> Construir Web
                        </button>
                    </div>
                </div>

                {/* HOMEPAGE STRATEGY */}
                <div className="bg-slate-900/80 p-6 rounded-xl border border-indigo-500/30">
                    <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" /> Estrategia Homepage
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">H1 Principal</label>
                            <input
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-bold"
                                value={researchData.home_structure?.h1 || ''}
                                onChange={(e) => {
                                    setResearchData({
                                        ...researchData,
                                        home_structure: { ...researchData.home_structure, h1: e.target.value }
                                    });
                                }}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">H2s (Secciones)</label>
                            {researchData.home_structure?.h2s?.map((h2, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-sm"
                                        value={h2}
                                        onChange={(e) => {
                                            const newH2s = [...researchData.home_structure.h2s];
                                            newH2s[idx] = e.target.value;
                                            setResearchData({
                                                ...researchData,
                                                home_structure: { ...researchData.home_structure, h2s: newH2s }
                                            });
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const newH2s = researchData.home_structure.h2s.filter((_, i) => i !== idx);
                                            setResearchData({
                                                ...researchData,
                                                home_structure: { ...researchData.home_structure, h2s: newH2s }
                                            });
                                        }}
                                        className="text-red-500 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newH2s = [...(researchData.home_structure?.h2s || []), "Nuevo H2"];
                                    setResearchData({
                                        ...researchData,
                                        home_structure: { ...researchData.home_structure, h2s: newH2s }
                                    });
                                }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2"
                            >
                                <Plus className="w-3 h-3" /> Añadir H2
                            </button>
                        </div>
                    </div>
                </div>

                {/* CLUSTERS GRID */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Clusters de Servicios ({clusters.length})</h3>
                    <button onClick={handleAddCluster} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Añadir Cluster
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {clusters.map((cluster, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200 text-slate-800">
                            <div className="bg-slate-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold w-fit mb-1">
                                            SERVICE CLUSTER {i + 1}
                                        </span>
                                        <input
                                            className="bg-transparent text-xl font-bold text-white border-none outline-none focus:ring-0 p-0"
                                            value={cluster.name}
                                            onChange={(e) => {
                                                const newClusters = [...researchData.clusters];
                                                newClusters[i].name = e.target.value;
                                                setResearchData({ ...researchData, clusters: newClusters });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1 rounded border border-slate-700">
                                        Total Vol: <span className="text-green-400 font-bold">{cluster.volume}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCluster(i)}
                                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-slate-700"
                                        title="Eliminar Cluster"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 grid lg:grid-cols-2 gap-8">
                                {/* Left: Meta Data */}
                                <div className="space-y-4">
                                    {/* Suggestion Selector */}
                                    {cluster.meta_suggestions && cluster.meta_suggestions.length > 0 && (
                                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                            <label className="text-xs font-bold text-indigo-700 uppercase block mb-2">
                                                Meta Tag Variation
                                            </label>
                                            <select
                                                className="w-full bg-white border border-indigo-300 rounded px-3 py-2 text-sm font-medium text-indigo-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={cluster.selected_suggestion || 0}
                                                onChange={(e) => {
                                                    const newClusters = [...researchData.clusters];
                                                    newClusters[i].selected_suggestion = parseInt(e.target.value);
                                                    setResearchData({ ...researchData, clusters: newClusters });
                                                }}
                                            >
                                                {cluster.meta_suggestions.map((_, idx) => (
                                                    <option key={idx} value={idx}>
                                                        Suggestion {idx + 1} of {cluster.meta_suggestions.length}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">H1 Header</label>
                                        <input
                                            className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-lg font-bold text-slate-800"
                                            value={
                                                cluster.meta_suggestions && cluster.meta_suggestions.length > 0
                                                    ? cluster.meta_suggestions[cluster.selected_suggestion || 0].h1
                                                    : cluster.h1 || ''
                                            }
                                            onChange={(e) => {
                                                const newClusters = [...researchData.clusters];
                                                const selectedIdx = newClusters[i].selected_suggestion || 0;
                                                if (newClusters[i].meta_suggestions && newClusters[i].meta_suggestions[selectedIdx]) {
                                                    newClusters[i].meta_suggestions[selectedIdx].h1 = e.target.value;
                                                } else {
                                                    newClusters[i].h1 = e.target.value;
                                                }
                                                setResearchData({ ...researchData, clusters: newClusters });
                                            }}
                                        />
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                        <label className="text-xs font-bold text-slate-400 uppercase">SEO Title</label>
                                        <input
                                            className="w-full bg-transparent border-none outline-none text-sm text-blue-600 font-medium truncate"
                                            value={
                                                cluster.meta_suggestions && cluster.meta_suggestions.length > 0
                                                    ? cluster.meta_suggestions[cluster.selected_suggestion || 0].seo_title
                                                    : cluster.seo_title || ''
                                            }
                                            onChange={(e) => {
                                                const newClusters = [...researchData.clusters];
                                                const selectedIdx = newClusters[i].selected_suggestion || 0;
                                                if (newClusters[i].meta_suggestions && newClusters[i].meta_suggestions[selectedIdx]) {
                                                    newClusters[i].meta_suggestions[selectedIdx].seo_title = e.target.value;
                                                } else {
                                                    newClusters[i].seo_title = e.target.value;
                                                }
                                                setResearchData({ ...researchData, clusters: newClusters });
                                            }}
                                        />
                                        <label className="text-xs font-bold text-slate-400 uppercase mt-2 block">Meta Description</label>
                                        <textarea
                                            className="w-full bg-transparent border-none outline-none text-xs text-slate-600 resize-none h-12"
                                            value={
                                                cluster.meta_suggestions && cluster.meta_suggestions.length > 0
                                                    ? cluster.meta_suggestions[cluster.selected_suggestion || 0].seo_description
                                                    : cluster.seo_description || ''
                                            }
                                            onChange={(e) => {
                                                const newClusters = [...researchData.clusters];
                                                const selectedIdx = newClusters[i].selected_suggestion || 0;
                                                if (newClusters[i].meta_suggestions && newClusters[i].meta_suggestions[selectedIdx]) {
                                                    newClusters[i].meta_suggestions[selectedIdx].seo_description = e.target.value;
                                                } else {
                                                    newClusters[i].seo_description = e.target.value;
                                                }
                                                setResearchData({ ...researchData, clusters: newClusters });
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Right: Keywords Management */}
                                <div>
                                    <div className="bg-slate-100 text-slate-600 px-3 py-2 text-xs font-bold uppercase mb-2 flex justify-between items-center">
                                        <span>Keywords ({cluster.keywords?.length || 0})</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const keyword = prompt('Enter keyword to add:');
                                                    if (keyword && keyword.trim()) {
                                                        const newClusters = [...researchData.clusters];
                                                        if (!newClusters[i].keywords) newClusters[i].keywords = [];
                                                        newClusters[i].keywords.push({
                                                            keyword: keyword.trim(),
                                                            volume: 0,
                                                            source: 'manual'
                                                        });
                                                        setResearchData({ ...researchData, clusters: newClusters });
                                                    }
                                                }}
                                                className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs font-bold"
                                            >
                                                + Add
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const selectedKws = cluster.keywords?.filter((k, idx) =>
                                                        document.getElementById(`kw-${i}-${idx}`)?.checked
                                                    );
                                                    if (selectedKws && selectedKws.length > 0) {
                                                        if (confirm(`Delete ${selectedKws.length} selected keyword(s)?`)) {
                                                            const newClusters = [...researchData.clusters];
                                                            newClusters[i].keywords = cluster.keywords.filter((k, idx) =>
                                                                !document.getElementById(`kw-${i}-${idx}`)?.checked
                                                            );
                                                            setResearchData({ ...researchData, clusters: newClusters });
                                                        }
                                                    } else {
                                                        alert('No keywords selected');
                                                    }
                                                }}
                                                className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-bold"
                                            >
                                                🗑 Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Keyword Table */}
                                    <div className="bg-white border border-slate-200 rounded overflow-hidden max-h-64 overflow-y-auto">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-50 sticky top-0">
                                                <tr className="border-b border-slate-200">
                                                    <th className="px-2 py-2 text-left w-8">
                                                        <input
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                cluster.keywords?.forEach((k, idx) => {
                                                                    const checkbox = document.getElementById(`kw-${i}-${idx}`);
                                                                    if (checkbox) checkbox.checked = e.target.checked;
                                                                });
                                                            }}
                                                            className="cursor-pointer"
                                                        />
                                                    </th>
                                                    <th className="px-2 py-2 text-left font-bold text-slate-600">Keyword</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Search Volume">Vol</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Cost Per Click">CPC</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Competition (0-1)">Comp</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="SEO Difficulty (0-100)">Diff</th>
                                                    <th className="px-2 py-2 text-center font-bold text-slate-600">Move</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cluster.keywords?.map((k, idx) => {
                                                    // Color coding helpers
                                                    const getCpcColor = (cpc) => {
                                                        if (!cpc || cpc === 0) return 'text-slate-400';
                                                        if (cpc < 1) return 'text-green-600';
                                                        if (cpc < 3) return 'text-yellow-600';
                                                        return 'text-red-600';
                                                    };

                                                    const getCompColor = (comp) => {
                                                        if (!comp || comp === 0) return 'text-slate-400';
                                                        if (comp < 0.3) return 'text-green-600';
                                                        if (comp < 0.7) return 'text-yellow-600';
                                                        return 'text-red-600';
                                                    };

                                                    const getDiffColor = (diff) => {
                                                        if (!diff || diff === 0) return 'text-slate-400';
                                                        if (diff < 30) return 'text-green-600';
                                                        if (diff < 60) return 'text-yellow-600';
                                                        return 'text-red-600';
                                                    };

                                                    return (
                                                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="px-2 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`kw-${i}-${idx}`}
                                                                    className="cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="px-2 py-2 text-slate-700">{k.keyword}</td>
                                                            <td className="px-2 py-2 text-right text-green-600 font-mono font-bold">{k.volume || 0}</td>
                                                            <td className={`px-2 py-2 text-right font-mono ${getCpcColor(k.cpc)}`}>
                                                                {k.cpc ? `€${k.cpc.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className={`px-2 py-2 text-right font-mono ${getCompColor(k.competition)}`}>
                                                                {k.competition ? k.competition.toFixed(2) : '-'}
                                                            </td>
                                                            <td className={`px-2 py-2 text-right font-mono ${getDiffColor(k.difficulty)}`}>
                                                                {k.difficulty || '-'}
                                                            </td>
                                                            <td className="px-2 py-2 text-center">
                                                                <select
                                                                    className="text-xs border border-slate-300 rounded px-1 py-0.5"
                                                                    onChange={(e) => {
                                                                        const targetClusterIdx = parseInt(e.target.value);
                                                                        if (targetClusterIdx !== i) {
                                                                            if (confirm(`Move "${k.keyword}" to cluster "${researchData.clusters[targetClusterIdx].name}"?`)) {
                                                                                const newClusters = [...researchData.clusters];
                                                                                newClusters[i].keywords = newClusters[i].keywords.filter((_, kidx) => kidx !== idx);
                                                                                if (!newClusters[targetClusterIdx].keywords) {
                                                                                    newClusters[targetClusterIdx].keywords = [];
                                                                                }
                                                                                newClusters[targetClusterIdx].keywords.push(k);
                                                                                setResearchData({ ...researchData, clusters: newClusters });
                                                                            }
                                                                        }
                                                                        e.target.value = i;
                                                                    }}
                                                                    value={i}
                                                                >
                                                                    <option value={i}>--</option>
                                                                    {researchData.clusters.map((c, cidx) => (
                                                                        cidx !== i && (
                                                                            <option key={cidx} value={cidx}>
                                                                                → {c.name}
                                                                            </option>
                                                                        )
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CONFIRMATION MODAL */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
                        <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">🚀 Confirmar Generación</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Clusters de Servicios:</span>
                                    <span className="text-white font-bold">{calculateTotals().clusters}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Total Keywords:</span>
                                    <span className="text-white font-bold">{calculateTotals().keywords}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Páginas a Generar:</span>
                                    <span className="text-white font-bold">{calculateTotals().pages}</span>
                                </div>
                                <div className="flex justify-between text-sm border-t border-slate-700 pt-3">
                                    <span className="text-slate-400">Páginas de Localidades:</span>
                                    <span className={`font-bold ${formData.generateLocations ? 'text-green-400' : 'text-slate-500'}`}>
                                        {formData.generateLocations ? `✓ Sí (${researchData.locations?.length || 0})` : '✗ No'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 mb-6">
                                ⚠️ Esta acción generará contenido con IA y sobrescribirá los archivos existentes.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center justify-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="max-w-4xl mx-auto text-center py-20 bg-slate-800 rounded-xl shadow-xl border border-green-900 text-white">
                <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-2">¡Web Terminada!</h2>
                <p className="text-slate-400 mb-8">El sitio ha sido generado y configurado.</p>
                <div className="flex justify-center gap-4">
                    <a href="/" target="_blank" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold">Ver Web</a>
                    <a href="/keystatic" target="_blank" className="bg-slate-700 text-white px-8 py-3 rounded-lg font-bold">Ir al CMS</a>
                </div>
            </div>
        );
    }

    return null;
}