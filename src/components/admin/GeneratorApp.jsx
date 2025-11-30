import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check, Loader2, Database, Globe, AlertTriangle, ArrowLeftRight, ChevronRight, Settings, List, Eye, Cloud, Bot, Trash2, Save } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';

export default function GeneratorApp() {
    const [step, setStep] = useState('input'); // input | loading | selection | review | generating | success
    const [formData, setFormData] = useState({
        niche: '',
        city: '',
        locationCode: null,  // Código numérico para SERP endpoints
        locationName: null,  // Nombre completo para Labs endpoints
        searchEngine: 'google.es',
        searchLocation: 'Spain',
        seedKeyword: ''
    });
    const [researchData, setResearchData] = useState(null);
    const [selectedCompetitors, setSelectedCompetitors] = useState(new Set());
    const [selectedCompKeywords, setSelectedCompKeywords] = useState({});
    const [logs, setLogs] = useState([]);
    const [activeMenuClusterId, setActiveMenuClusterId] = useState(null);

    // Auto-update seed keyword
    useEffect(() => {
        if (formData.niche && formData.city) {
            setFormData(prev => ({
                ...prev,
                seedKeyword: `${prev.niche} ${prev.city}`
            }));
        }
    }, [formData.niche, formData.city]);

    const handleSwapWords = () => {
        const current = formData.seedKeyword;
        const option1 = `${formData.niche} ${formData.city}`;
        const option2 = `${formData.city} ${formData.niche}`;
        setFormData(prev => ({
            ...prev,
            seedKeyword: current === option1 ? option2 : option1
        }));
    };

    // PASO 1: OBTENER LISTA DE COMPETIDORES
    const handleResearch = async (e) => {
        e.preventDefault();
        setStep('loading');
        setLogs(["🚀 Buscando competidores en Google..."]);

        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche: formData.niche,
                    city: formData.city,
                    locationCode: formData.locationCode  // NUEVO: enviar código de ubicación
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

    // PASO 2: CLUSTERIZAR
    const handleFinishSelection = async () => {
        setStep('loading');
        setLogs(["🕵️ Extrayendo keywords...", "🧠 IA realizando Clustering...", "✨ Optimizando Meta Tags..."]);

        try {
            const selectedDomainsArray = Array.from(selectedCompetitors);

            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    niche: formData.niche,
                    city: formData.city,
                    competitors: selectedDomainsArray,
                    locationCode: formData.locationCode,
                    locationName: formData.locationName  // NUEVO: nombre para Labs endpoints
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResearchData(data);
            setStep('review');

        } catch (err) {
            alert(err.message);
            setStep('selection'); // Volver atrás si falla
        }
    };

    const handleGenerate = async () => {
        setStep('generating');
        setLogs(prev => [...prev, "🏗️ Construyendo sitio web..."]);
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

    const Stepper = ({ currentStep }) => {
        const steps = [
            { id: 1, name: 'Location', key: 'input' },
            { id: 2, name: 'Services', key: 'selection' },
            { id: 3, name: 'Result', key: 'review' }
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
                        <button type="submit" className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2">
                            Continue <ChevronRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (step === 'loading' || step === 'generating') {
        return (
            <div className="max-w-4xl mx-auto text-white text-center py-20">
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-indigo-500" />
                <h3 className="text-2xl font-bold mb-2">{step === 'loading' ? 'Analizando Datos...' : 'Construyendo Web...'}</h3>
                <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-lg text-left font-mono text-xs text-green-400 h-48 overflow-y-auto border border-slate-800">
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
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

    // VISTA DE REVISIÓN (DONDE FALLABA)
    if (step === 'review' && researchData) {
        // Datos seguros con fallback para evitar crash si faltan propiedades
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
                    <button onClick={handleGenerate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                        <Check className="w-5 h-5" /> Construir Web
                    </button>
                </div>

                {/* INSIGHTS BOX (TOP KEYWORDS) */}
                <div className="bg-slate-900/80 p-6 rounded-xl border border-indigo-500/30">
                    <h3 className="text-lg font-bold text-indigo-400 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" /> Top Keywords de Mercado
                    </h3>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Keyword</th>
                                    <th className="px-4 py-2 text-right">Vol</th>
                                    <th className="px-4 py-2 text-right">Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topKeywords.length > 0 ? (
                                    topKeywords.map((k, i) => (
                                        <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50">
                                            <td className="px-4 py-2 text-slate-300">{k.keyword}</td>
                                            <td className="px-4 py-2 text-right text-green-400 font-mono">{k.volume}</td>
                                            <td className="px-4 py-2 text-right text-xs text-slate-500">{k.source}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="3" className="p-4 text-center text-slate-500">No hay keywords disponibles</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CLUSTERS GRID */}
                <div className="grid grid-cols-1 gap-6">
                    {clusters.map((cluster, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200 text-slate-800">
                            <div className="bg-slate-800 p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-500 text-white text-xs px-2 py-1 rounded font-bold">SILO {i + 1}</span>
                                    <h3 className="text-lg font-bold text-white">{cluster.name}</h3>
                                </div>
                                <div className="text-xs text-slate-400 font-mono">Vol Total: {cluster.volume}</div>
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
                                            <p className="text-xs text-indigo-600 mt-2">
                                                💡 Choose the variation that best fits your strategy
                                            </p>
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
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Ranking Position">Pos</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Search Volume">Vol</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Cost Per Click (€)">CPC</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="Competition Level (0-1)">Comp</th>
                                                    <th className="px-2 py-2 text-right font-bold text-slate-600" title="SEO Difficulty (0-100)">Diff</th>
                                                    <th className="px-2 py-2 text-center font-bold text-slate-600">Move</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cluster.keywords?.map((k, idx) => {
                                                    // Color coding for metrics
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
                                                            <td className={`px-2 py-2 text-right font-mono text-xs font-bold ${k.position ? (
                                                                    k.position <= 3 ? 'text-green-600' :
                                                                        k.position <= 10 ? 'text-yellow-600' :
                                                                            'text-slate-400'
                                                                ) : 'text-slate-300'
                                                                }`}>
                                                                {k.position || '-'}
                                                            </td>
                                                            <td className="px-2 py-2 text-right text-green-600 font-mono">{k.volume}</td>
                                                            <td className={`px-2 py-2 text-right font-mono text-xs ${getCpcColor(k.cpc)}`}>
                                                                {k.cpc ? `€${k.cpc.toFixed(2)}` : '-'}
                                                            </td>
                                                            <td className={`px-2 py-2 text-right font-mono text-xs ${getCompColor(k.competition)}`}>
                                                                {k.competition ? k.competition.toFixed(2) : '-'}
                                                            </td>
                                                            <td className={`px-2 py-2 text-right font-mono text-xs ${getDiffColor(k.difficulty)}`}>
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
                                                                                // Remove from current cluster
                                                                                newClusters[i].keywords = newClusters[i].keywords.filter((_, kidx) => kidx !== idx);
                                                                                // Add to target cluster
                                                                                if (!newClusters[targetClusterIdx].keywords) {
                                                                                    newClusters[targetClusterIdx].keywords = [];
                                                                                }
                                                                                newClusters[targetClusterIdx].keywords.push(k);
                                                                                setResearchData({ ...researchData, clusters: newClusters });
                                                                            }
                                                                        }
                                                                        e.target.value = i; // Reset selector
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