
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Check, Loader2, Database, Globe, AlertTriangle, ArrowLeftRight, ChevronRight, Settings, List, Eye, Cloud, Bot, Trash2, Save } from 'lucide-react';

export default function GeneratorApp() {
    const [step, setStep] = useState('input'); // input | loading | selection | review | generating | success
    const [formData, setFormData] = useState({
        niche: '',
        city: '',
        searchEngine: 'google.com',
        searchLocation: 'United States', // Default for the UI example
        seedKeyword: ''
    });
    const [researchData, setResearchData] = useState(null);
    const [selectedCompetitors, setSelectedCompetitors] = useState(new Set());
    const [selectedCompKeywords, setSelectedCompKeywords] = useState({});
    const [logs, setLogs] = useState([]);

    // Auto-update seed keyword when niche or city changes, unless manually edited (simplified logic for now)
    useEffect(() => {
        if (formData.niche && formData.city) {
            setFormData(prev => ({
                ...prev,
                seedKeyword: `${prev.niche} ${prev.city} `
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

    const handleResearch = async (e) => {
        e.preventDefault();
        setStep('loading');
        setLogs(["🚀 Iniciando Agent X...", "📡 Analizando SERPs y Volúmenes...", "🕵️ Espiando Competencia..."]);

        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // Normalización de datos por seguridad
            if (data.services) {
                data.services = data.services.map(s =>
                    typeof s === 'string' ? { title: s, volume: 0, main_keyword: s } : s
                );
            }

            // Fallback: Si Gemini devuelve 'services' en lugar de 'clusters', lo mapeamos
            if (!data.clusters && data.services) {
                data.clusters = data.services.map(s => ({
                    name: s.title,
                    main_keyword: s.main_keyword,
                    volume: s.volume,
                    h1: s.title,
                    seo_title: `${s.title} in ${formData.city} | Top Rated Service`,
                    seo_description: `Best ${s.title} in ${formData.city}. Professional and affordable services. Contact us today!`,
                    keywords: [] // No keywords if falling back from simple services
                }));
            }

            setResearchData(data);

            // Pre-select all competitors by default
            if (data.raw_data?.competitors) {
                const allDomains = new Set(data.raw_data.competitors.map(c => c.domain));
                setSelectedCompetitors(allDomains);
            }

            setStep('selection'); // Go to selection step instead of review
        } catch (err) {
            alert("Error: " + err.message);
            setStep('input');
        }
    };

    const handleFinishSelection = () => {
        // Filter competitor keywords based on selection
        if (researchData?.raw_data?.competitor_keywords) {
            const filteredKeywords = {};
            Object.entries(researchData.raw_data.competitor_keywords).forEach(([domain, kws]) => {
                if (selectedCompetitors.has(domain)) {
                    filteredKeywords[domain] = kws;
                }
            });

            // Update researchData with filtered keywords (shallow copy for UI display)
            // We keep the original raw_data intact but maybe we should update it?
            // For now, let's just update the state that the Review view uses.
            // Actually, the Review view uses researchData.raw_data.competitor_keywords directly.
            // Let's update it.
            const updatedData = {
                ...researchData,
                raw_data: {
                    ...researchData.raw_data,
                    competitor_keywords: filteredKeywords
                }
            };
            setResearchData(updatedData);
        }
        setStep('review');
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

    // --- COMPONENTS ---

    const Stepper = ({ currentStep }) => {
        const steps = [
            { id: 1, name: 'Location', key: 'input' },
            { id: 2, name: 'Services', key: 'selection' }, // Selection is Step 2
            { id: 3, name: 'Result', key: 'review' } // Review is Step 3
        ];

        return (
            <div className="flex items-center justify-between mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                {steps.map((s, idx) => {
                    const isActive = currentStep === s.key ||
                        (currentStep === 'loading' && s.key === 'input') ||
                        (currentStep === 'generating' && s.key === 'review');

                    let isCompleted = false;
                    if (currentStep === 'selection' && idx < 1) isCompleted = true; // input is completed
                    if (currentStep === 'review' && idx < 2) isCompleted = true;    // input and selection are completed
                    if (currentStep === 'generating' && idx < 2) isCompleted = true; // input and selection are completed
                    if (currentStep === 'success') isCompleted = true;              // all steps completed

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

                        {/* Business Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Enter a <span className="text-white font-bold underline decoration-indigo-500">Keyword</span> that best describes your Business
                            </label>
                            <input
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-4 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-lg placeholder-slate-600 transition-all"
                                placeholder="e.g. Liposuction"
                                value={formData.niche}
                                onChange={e => setFormData({ ...formData, niche: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Search Engine */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Search Engine</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-300"
                                        value={formData.searchEngine}
                                        onChange={e => setFormData({ ...formData, searchEngine: e.target.value })}
                                    >
                                        <option value="google.com">google.com (United States/English)</option>
                                        <option value="google.es">google.es (Spain/Spanish)</option>
                                    </select>
                                    <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">▼</div>
                                </div>
                            </div>

                            {/* Search Location */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Search Location</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. New York"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seed Keyword */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Seed Keyword for your website is:</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white text-slate-900 font-bold border-2 border-slate-300 rounded-lg py-4 px-4 pr-24 focus:ring-2 focus:ring-indigo-500 outline-none text-xl shadow-inner"
                                    value={formData.seedKeyword}
                                    readOnly
                                />
                                <button
                                    type="button"
                                    onClick={handleSwapWords}
                                    className="absolute right-2 top-2 bottom-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 rounded-md flex flex-col items-center justify-center text-xs border border-slate-300 transition-colors"
                                >
                                    <ArrowLeftRight className="w-4 h-4 mb-1" />
                                    Swap
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                If you feel the keyword is correct, press <strong>Continue</strong>. If not, go back to make adjustments.
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg flex gap-3 items-start">
                            <div className="bg-indigo-500/20 p-1 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-indigo-400" />
                            </div>
                            <p className="text-sm text-indigo-200">
                                By clicking on Search button we will pull <strong>Top 10 competitor websites</strong> on Google for provided keyword which will be presented on the next step.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4">
                            <button type="button" className="px-6 py-3 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
                                ✕ Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/50 flex items-center gap-2 transition-all transform hover:scale-105"
                            >
                                Continue <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        );
    }

    if (step === 'loading' || step === 'generating') {
        return (
            <div className="max-w-4xl mx-auto text-white">
                <Stepper currentStep={step === 'loading' ? 'input' : 'review'} />
                <div className="text-center py-20">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-6 text-indigo-500" />
                    <h3 className="text-2xl font-bold mb-2">{step === 'loading' ? 'Analizando Datos...' : 'Construyendo Web...'}</h3>
                    <div className="max-w-md mx-auto bg-slate-950 p-4 rounded-lg text-left font-mono text-xs text-green-400 h-48 overflow-y-auto border border-slate-800">
                        {logs.map((l, i) => <div key={i}>{l}</div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'selection' && researchData) {
        return (
            <div className="max-w-4xl mx-auto text-white">
                <Stepper currentStep="selection" />

                <div className="space-y-6">
                    {/* Info Box */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex gap-3 items-start">
                        <div className="bg-slate-700 p-1 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-300">
                            Now select which website most resembles what you want to create, and we are Audit and pull their ranking keywords
                        </p>
                    </div>

                    {/* Filters (Visual only for now) */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-slate-800 rounded-full px-3 py-1 border border-slate-700">
                                <div className="w-8 h-4 bg-slate-600 rounded-full relative mr-2 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full absolute left-0"></div>
                                </div>
                                <span className="text-sm text-slate-300">{formData.city}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Location</span>
                            <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-300">
                                <option>United States (en)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Find ranking keywords from Page URL only</span>
                            <div className="w-10 h-5 bg-slate-600 rounded-full relative cursor-pointer">
                                <div className="w-5 h-5 bg-white rounded-full absolute left-0 shadow-sm"></div>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (researchData.raw_data?.competitors) {
                                    const all = new Set(researchData.raw_data.competitors.map(c => c.domain));
                                    setSelectedCompetitors(all);
                                }
                            }}
                            className="bg-indigo-900 text-indigo-200 px-4 py-2 rounded text-sm font-bold hover:bg-indigo-800 transition-colors"
                        >
                            Select All Recommended
                        </button>
                    </div>

                    {/* Competitor List */}
                    <div className="space-y-4">
                        {researchData.raw_data?.competitors?.map((comp, idx) => (
                            <div key={idx} className="bg-white text-slate-900 p-6 rounded-lg border border-slate-200 shadow-sm relative">
                                {idx === 0 && (
                                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                        RECOMMENDED
                                    </div>
                                )}
                                <div className="flex justify-between items-start">
                                    <div className="pr-12">
                                        <div className="text-xs text-slate-500 mb-1">{comp.url}</div>
                                        <h3 className="text-lg font-bold text-indigo-900 mb-2">{comp.title}</h3>
                                        <p className="text-sm text-slate-600">{comp.description || "No description available."}</p>
                                    </div>
                                    <div className="mt-2">
                                        <input
                                            type="checkbox"
                                            className="w-6 h-6 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                            checked={selectedCompetitors.has(comp.domain)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedCompetitors);
                                                if (e.target.checked) newSet.add(comp.domain);
                                                else newSet.delete(comp.domain);
                                                setSelectedCompetitors(newSet);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-slate-700">
                        <div className="bg-indigo-900/50 text-indigo-300 px-4 py-2 rounded font-mono text-sm border border-indigo-500/30">
                            Cost: 0 XAGS
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('input')}
                                className="px-6 py-2 border border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
                            >
                                ✕ Cancel
                            </button>
                            <button
                                onClick={handleFinishSelection}
                                className="px-8 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-900/50 flex items-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Finish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'review' && researchData) {
        return (
            <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-slate-200">
                <Stepper currentStep="review" />

                {/* Header Review */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center sticky top-4 z-50 shadow-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white">Estrategia Propuesta</h2>
                        <p className="text-sm text-slate-400 mt-1">{researchData.market_analysis}</p>
                    </div>
                    <button onClick={handleGenerate} className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-900/20 transition-all">
                        <Check className="w-5 h-5" /> Aprobar y Construir
                    </button>
                </div>

                {/* --- NUEVA SECCIÓN: INSIGHTS DE INVESTIGACIÓN (CAJA DE CRISTAL) --- */}
                {researchData.raw_data && (
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-indigo-500/30">
                        <h3 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" /> Insights de Investigación (Por qué elegimos esto)
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Tabla de Keywords */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Top Keywords (Volumen Real)</h4>
                                <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-900 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2">Keyword</th>
                                                <th className="px-4 py-2 text-right">Volumen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {researchData.raw_data.top_keywords?.map((k, i) => (
                                                <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50">
                                                    <td className="px-4 py-2 text-slate-300">{k.keyword}</td>
                                                    <td className="px-4 py-2 text-right text-green-400 font-mono">{k.volume}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Razonamiento de la IA */}
                            <div className="space-y-4">
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase mb-2">🧠 Lógica de Servicios</h4>
                                    <p className="text-sm text-slate-300 italic">"{researchData.reasoning_services || 'Análisis basado en volumen de búsqueda y competencia.'}"</p>
                                </div>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                    <h4 className="text-xs font-bold text-green-400 uppercase mb-2">🌍 Lógica de Zonas</h4>
                                    <p className="text-sm text-slate-300 italic">"{researchData.reasoning_locations || 'Selección basada en densidad de población y competencia local.'}"</p>
                                </div>
                            </div>
                        </div>
                        {/* Competitor Keywords Selection */}
                        <div className="mt-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Keywords de Competidores (elige los que quieras trabajar)</h4>
                            {Object.entries(researchData.raw_data.competitor_keywords || {}).map(([domain, keywords]) => (
                                <div key={domain} className="mb-4">
                                    <h5 className="text-xs font-medium text-indigo-300 mb-1">{domain}</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {keywords.map((kw, idx) => {
                                            const isSelected = selectedCompKeywords[domain]?.includes(kw.keyword);
                                            return (
                                                <label key={idx} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!isSelected}
                                                        onChange={e => {
                                                            setSelectedCompKeywords(prev => {
                                                                const cur = prev[domain] || [];
                                                                const newList = e.target.checked
                                                                    ? [...cur, kw.keyword]
                                                                    : cur.filter(k => k !== kw.keyword);
                                                                return { ...prev, [domain]: newList };
                                                            });
                                                        }}
                                                        className="form-checkbox h-4 w-4 text-indigo-600"
                                                    />
                                                    <span className="text-sm text-slate-300">{kw.keyword} ({kw.volume})</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {/* --------------------------------------------------------------- */}

                {/* --- CLUSTERS / PROJECT PLANNER --- */}
                <div className="space-y-8">
                    {researchData.clusters?.map((cluster, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200">
                            {/* Header Azul */}
                            <div className="bg-slate-800 p-4 flex justify-between items-center relative">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500 bg-slate-700"
                                        defaultChecked
                                    />
                                    <h3 className="text-lg font-bold text-white">{cluster.name}</h3>
                                </div>
                                <div className="flex gap-2 relative">
                                    {/* Actions Menu Trigger */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenuClusterId(activeMenuClusterId === i ? null : i)}
                                            className={`p-2 rounded transition-colors ${activeMenuClusterId === i ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                        >
                                            <Settings className="w-4 h-4" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenuClusterId === i && (
                                            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                <div className="py-1">
                                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Keyword Management</div>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Add Keywords
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteKeywords(i)}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                                                    >
                                                        Delete Selected Keywords
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Get Volume & CPC
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                                                        Get Competition
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Track Rankings
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Copy To Clipboard
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        See Keywords
                                                    </button>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Cluster Keywords
                                                    </button>

                                                    <div className="border-t border-slate-100 my-1"></div>

                                                    <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Group Management</div>
                                                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                                        Move Group
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCluster(i)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        Delete Group
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><List className="w-4 h-4" /></button>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Eye className="w-4 h-4" /></button>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Cloud className="w-4 h-4" /></button>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Bot className="w-4 h-4" /></button>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Trash2 className="w-4 h-4" /></button>
                                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><Save className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="p-6 grid lg:grid-cols-2 gap-8">
                                {/* Left Column: Optimization Fields */}
                                <div className="space-y-4">
                                    {/* H1 Input */}
                                    <div className="flex items-center gap-2">
                                        <div className="bg-indigo-900 text-white font-bold px-2 py-1 rounded text-xs">H1</div>
                                        <input
                                            className="w-full border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-1 text-lg font-medium text-slate-800 placeholder-slate-400"
                                            placeholder="eg. My Header"
                                            value={cluster.h1}
                                            onChange={(e) => {
                                                const newClusters = [...researchData.clusters];
                                                newClusters[i] = { ...newClusters[i], h1: e.target.value };
                                                setResearchData({ ...researchData, clusters: newClusters });
                                            }}
                                        />
                                    </div>

                                    {/* SEO Title & Desc Box */}
                                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>SEO Title</span>
                                                <span className={`${cluster.seo_title?.length > 60 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {cluster.seo_title?.length || 0} / 60
                                                </span>
                                            </div>
                                            <input
                                                className="w-full border border-slate-300 rounded p-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                                                value={cluster.seo_title || ''}
                                                onChange={(e) => {
                                                    const newClusters = [...researchData.clusters];
                                                    newClusters[i] = { ...newClusters[i], seo_title: e.target.value };
                                                    setResearchData({ ...researchData, clusters: newClusters });
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>SEO Description</span>
                                                <span className={`${cluster.seo_description?.length > 160 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {cluster.seo_description?.length || 0} / 160
                                                </span>
                                            </div>
                                            <textarea
                                                className="w-full border border-slate-300 rounded p-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
                                                value={cluster.seo_description || ''}
                                                onChange={(e) => {
                                                    const newClusters = [...researchData.clusters];
                                                    newClusters[i] = { ...newClusters[i], seo_description: e.target.value };
                                                    setResearchData({ ...researchData, clusters: newClusters });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Keywords Table & Actions */}
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <button className="bg-slate-100 text-slate-600 px-4 py-2 rounded text-sm font-bold border border-slate-300 hover:bg-slate-200 flex items-center gap-2">
                                            CONNECT GROUP <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2 grid grid-cols-12 gap-2">
                                            <div className="col-span-1"></div>
                                            <div className="col-span-7">Keyword</div>
                                            <div className="col-span-2 text-right">Vol</div>
                                            <div className="col-span-2 text-right">CPC</div>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {cluster.keywords?.map((k, idx) => (
                                                <div key={idx} className="px-4 py-2 border-b border-slate-200 text-xs grid grid-cols-12 gap-2 items-center hover:bg-indigo-50">
                                                    <div className="col-span-1">
                                                        <input type="checkbox" className="rounded border-slate-300 text-indigo-600" defaultChecked />
                                                    </div>
                                                    <div className="col-span-7 font-medium text-slate-700 truncate" title={k.keyword || k}>
                                                        {k.keyword || k}
                                                    </div>
                                                    <div className="col-span-2 text-right text-green-600 font-mono">
                                                        {k.volume || '-'}
                                                    </div>
                                                    <div className="col-span-2 text-right text-slate-500 font-mono">
                                                        {k.cpc || '-'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ZONAS Y HOME (Legacy/Secondary) */}
                <div className="grid lg:grid-cols-2 gap-6 mt-8">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-green-400 flex items-center gap-2">
                            <MapPin className="w-5 h-5" /> Zonas Locales
                        </h3>
                        <div className="grid gap-3">
                            {researchData.locations?.map((loc, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-green-500 outline-none"
                                    value={loc}
                                    onChange={(e) => {
                                        const newLocs = [...researchData.locations];
                                        newLocs[i] = e.target.value;
                                        setResearchData({ ...researchData, locations: newLocs });
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="font-bold text-lg mb-4 text-white">Estructura Home</h3>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">H1 Principal</label>
                            <input
                                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white mt-1"
                                value={researchData.home_structure?.h1 || ''}
                                onChange={(e) => setResearchData({
                                    ...researchData,
                                    home_structure: { ...researchData.home_structure, h1: e.target.value }
                                })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="max-w-4xl mx-auto">
                <Stepper currentStep="success" />
                <div className="text-center py-20 bg-slate-800 rounded-xl shadow-xl border border-green-900">
                    <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Web Terminada!</h2>
                    <div className="flex justify-center gap-4 mt-8">
                        <a href="/" target="_blank" className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-500">Ver Web</a>
                        <a href="/keystatic" target="_blank" className="bg-slate-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-600">Ir al CMS</a>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}