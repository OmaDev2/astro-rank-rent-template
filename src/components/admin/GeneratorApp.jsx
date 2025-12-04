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
    const [extractionOptions, setExtractionOptions] = useState({
        top10Only: true,  // ✅ Default to Top 10 Only (Phase 1 recommendation)
        minRelevance: 5,
        includeInfo: false,
        maxKeywords: 200,
        specificServices: '' // ✅ New field for specific services
    });
    const [logs, setLogs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [discoveredServices, setDiscoveredServices] = useState([]); // ✅ Nuevo estado para servicios

    // Auto-update seed keyword
    useEffect(() => {
        if (formData.niche && formData.city) {
            setFormData(prev => ({
                ...prev,
                seedKeyword: `${prev.niche} ${prev.city}`
            }));
        }
    }, [formData.niche, formData.city]);

    const handleDiscoverServices = async (e) => {
        e.preventDefault();

        // Validación frontend
        if (!formData.niche || !formData.niche.trim()) {
            alert('Por favor, ingresa un nicho/servicio');
            return;
        }
        if (!formData.city || !formData.city.trim()) {
            alert('Por favor, selecciona una ciudad');
            return;
        }

        setStep('loading');
        setLogs(["🧠 Consultando a Gemini sobre servicios del nicho..."]);

        try {
            const res = await fetch('/api/discover-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ niche: formData.niche.trim() })
            });

            const data = await res.json();

            if (data.error) {
                console.error('❌ API Error:', data);
                throw new Error(data.error);
            }

            setDiscoveredServices(data.services || []);
            setStep('services'); // ✅ Vamos al paso de validación de servicios
        } catch (err) {
            console.error('❌ Request failed:', err);
            alert(err.message);
            setStep('input');
        }
    };

    const handleGetCompetitors = async () => {
        setStep('loading');
        setLogs(["🚀 Buscando competidores locales en Google..."]);

        try {
            const requestBody = {
                niche: formData.niche.trim(),
                city: formData.city.trim(),
                location: formData.locationName || formData.city.toLowerCase()
            };

            console.log('📤 Sending request:', requestBody);

            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (data.error) {
                console.error('❌ API Error:', data);
                throw new Error(data.error);
            }

            setResearchData(data);
            if (data.raw_data?.competitors) {
                const allDomains = new Set(data.raw_data.competitors.map(c => c.domain));
                setSelectedCompetitors(allDomains);
            }
            setStep('selection');
        } catch (err) {
            console.error('❌ Request failed:', err);
            alert(err.message);
            setStep('services'); // Volver a servicios si falla
        }
    };

    const handleExtractKeywords = async () => {
        setStep('loading');
        setLogs([
            "🕵️ Extrayendo keywords de competidores locales...",
            "🎯 Filtrando por relevancia local...",
            "✨ Preparando lista para revisión..."
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
                    options: {
                        ...extractionOptions,
                        specificServices: discoveredServices,
                        skipClustering: true // ✅ Importante: Pausar antes de clusterizar
                    }
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResearchData(data);
            setStep('keywords'); // ✅ Vamos al paso de revisión de keywords

        } catch (err) {
            alert(err.message);
            setStep('selection');
        }
    };

    const handleClusterKeywords = async () => {
        setStep('loading');
        setLogs([
            "🧠 IA realizando Clustering inteligente...",
            "✨ Optimizando Meta Tags para SEO local...",
            "🏗️ Estructurando estrategia de contenidos..."
        ]);

        try {
            const res = await fetch('/api/cluster', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keywords: researchData.raw_data.top_keywords,
                    niche: formData.niche,
                    city: formData.city
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResearchData(prev => ({
                ...prev,
                clusters: data.clusters,
                home_structure: { h1: '', h2s: [] } // Inicializar estructura
            }));
            setStep('review');

        } catch (err) {
            alert(err.message);
            setStep('keywords');
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
            { id: 2, name: 'Services', key: 'services' },
            { id: 3, name: 'Competitors', key: 'selection' },
            { id: 4, name: 'Keywords', key: 'keywords' },
            { id: 5, name: 'Strategy', key: 'review' }
        ];

        return (
            <div className="flex items-center justify-between mb-8 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                {steps.map((s, idx) => {
                    const isActive = currentStep === s.key;
                    let isCompleted = false;
                    if (currentStep === 'services' && idx < 1) isCompleted = true;
                    if (currentStep === 'selection' && idx < 2) isCompleted = true;
                    if (currentStep === 'keywords' && idx < 3) isCompleted = true;
                    if (currentStep === 'review' && idx < 4) isCompleted = true;
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
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Generador de Nichos <span className="text-blue-400">Rank & Rent</span>
                    </h1>
                    <p className="text-slate-400">
                        Automatiza tu investigación de palabras clave, clustering y estructura web.
                    </p>
                </div>

                <form onSubmit={handleDiscoverServices} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl space-y-6">
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
        );
    }

    if (step === 'services') {
        return (
            <div className="max-w-4xl mx-auto text-white">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Validar Servicios</h2>
                    <p className="text-slate-400">Gemini ha identificado estos servicios para tu nicho. Edita o añade los que falten.</p>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {discoveredServices.map((service, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-900 p-3 rounded border border-slate-700">
                                <input
                                    type="text"
                                    value={service}
                                    onChange={(e) => {
                                        const newServices = [...discoveredServices];
                                        newServices[idx] = e.target.value;
                                        setDiscoveredServices(newServices);
                                    }}
                                    className="bg-transparent border-none text-white w-full focus:ring-0"
                                />
                                <button
                                    onClick={() => {
                                        const newServices = discoveredServices.filter((_, i) => i !== idx);
                                        setDiscoveredServices(newServices);
                                    }}
                                    className="text-slate-500 hover:text-red-400"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => setDiscoveredServices([...discoveredServices, 'Nuevo Servicio'])}
                            className="flex items-center justify-center gap-2 bg-slate-900/50 p-3 rounded border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Añadir Servicio
                        </button>
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={() => setStep('input')}
                        className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white"
                    >
                        Atrás
                    </button>
                    <button
                        onClick={handleGetCompetitors}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2"
                    >
                        Continuar a Competidores <ChevronRight className="w-5 h-5" />
                    </button>
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

                    {/* Extraction Options */}
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700 space-y-3">
                        <h3 className="font-bold text-blue-200 flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Opciones de Extracción
                        </h3>
                        <label className="flex items-center gap-3 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!extractionOptions.top10Only}
                                onChange={(e) => setExtractionOptions({ ...extractionOptions, top10Only: !e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-blue-100">Extraer TODAS las keywords (no solo top 10)</span>
                        </label>
                        <label className="flex items-center gap-3 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={extractionOptions.includeInfo}
                                onChange={(e) => setExtractionOptions({ ...extractionOptions, includeInfo: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-blue-100">Incluir keywords informacionales</span>
                        </label>

                        {/* Nuevo: Control de Relevancia */}
                        <div className="pt-2 border-t border-blue-700/30">
                            <label className="block text-sm text-blue-100 mb-2">
                                Filtro de Relevancia Mínima: <span className="font-bold text-blue-300">{extractionOptions.minRelevance}</span>
                                <span className="text-xs text-blue-400 ml-2">(0 = sin filtro, 10 = muy estricto)</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={extractionOptions.minRelevance}
                                onChange={(e) => setExtractionOptions({ ...extractionOptions, minRelevance: parseInt(e.target.value) })}
                                className="w-full h-2 bg-blue-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-blue-300 mt-1">
                                <span>Más keywords</span>
                                <span>Más calidad</span>
                            </div>
                        </div>
                    </div>

                    {/* Competitors List */}
                    <div className="grid gap-3">
                        {researchData.raw_data?.competitors?.map((comp, idx) => (
                            <div
                                key={idx}
                                className={`bg-white text-slate-900 p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedCompetitors.has(comp.domain)
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                    } ${!comp.recommended ? 'opacity-60' : ''}`}
                                onClick={() => {
                                    const newSet = new Set(selectedCompetitors);
                                    if (selectedCompetitors.has(comp.domain)) newSet.delete(comp.domain);
                                    else newSet.add(comp.domain);
                                    setSelectedCompetitors(newSet);
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-indigo-600 rounded border-slate-300 mt-1"
                                            checked={selectedCompetitors.has(comp.domain)}
                                            onChange={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1">
                                            <div className="font-bold text-indigo-900">{comp.domain}</div>
                                            <div className="text-sm text-slate-600 line-clamp-1">{comp.title}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-slate-500">Pos. {comp.position}</span>
                                        {comp.recommended ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                                ✓ Recomendado
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                                                {comp.reason}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-slate-700">
                        <button
                            onClick={() => setStep('services')}
                            className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white"
                        >
                            Atrás
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-400">
                                {selectedCompetitors.size} de {researchData.raw_data?.competitors?.length || 0} competidores seleccionados
                            </div>
                            <button
                                onClick={handleExtractKeywords}
                                disabled={selectedCompetitors.size === 0}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Search className="w-5 h-5" /> Extraer Keywords
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }



    // VISTA DE REVISIÓN DE KEYWORDS (NUEVO)
    if (step === 'keywords' && researchData) {
        const keywords = researchData.raw_data?.top_keywords || [];

        return (
            <div className="max-w-6xl mx-auto text-white">
                <Stepper currentStep="keywords" />

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Revisión de Keywords</h2>
                        <p className="text-slate-400">
                            Hemos encontrado <span className="text-indigo-400 font-bold">{keywords.length}</span> keywords relevantes.
                            Revisa y elimina las que no encajen antes de clusterizar.
                        </p>
                    </div>
                    <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-sm">
                        Total Volumen: <span className="text-green-400 font-bold">{keywords.reduce((acc, k) => acc + (k.volume || 0), 0)}</span>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden mb-6">
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800 text-slate-400 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4">Keyword</th>
                                    <th className="p-4">Volumen</th>
                                    <th className="p-4">Score</th>
                                    <th className="p-4">Fuente</th>
                                    <th className="p-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {keywords.map((k, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-medium text-white">{k.keyword}</td>
                                        <td className="p-4 text-slate-300">{k.volume}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${k.relevanceScore >= 8 ? 'bg-green-900 text-green-300' :
                                                k.relevanceScore >= 5 ? 'bg-blue-900 text-blue-300' :
                                                    'bg-slate-700 text-slate-300'
                                                }`}>
                                                {k.relevanceScore}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-slate-500 uppercase">{k.source}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => {
                                                    const newKeywords = keywords.filter((_, i) => i !== idx);
                                                    setResearchData(prev => ({
                                                        ...prev,
                                                        raw_data: {
                                                            ...prev.raw_data,
                                                            top_keywords: newKeywords
                                                        }
                                                    }));
                                                }}
                                                className="text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-700">
                    <button
                        onClick={() => setStep('selection')}
                        className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white"
                    >
                        Atrás
                    </button>
                    <button
                        onClick={handleClusterKeywords}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Bot className="w-5 h-5" /> Generar Clusters con IA
                    </button>
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

    // --- LOADING OVERLAY ---
    if (step === 'loading' || step === 'generating') {
        return (
            <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
                <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <Bot className="absolute inset-0 m-auto text-indigo-400 w-8 h-8 animate-pulse" />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {step === 'generating' ? 'Construyendo Sitio Web' : 'Analizando Datos'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Esto puede tomar unos momentos...
                        </p>
                    </div>

                    <div className="bg-slate-950 rounded-lg p-4 text-left h-48 overflow-y-auto font-mono text-xs border border-slate-800 shadow-inner">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>{' '}
                                <span className={i === logs.length - 1 ? "text-indigo-400 font-bold animate-pulse" : "text-slate-300"}>
                                    {log}
                                </span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <span className="text-slate-600 italic">Iniciando proceso...</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- SUCCESS VIEW ---
    if (step === 'success') {
        return (
            <div className="max-w-2xl mx-auto text-center py-12 animate-fade-in">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                    <Check className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">¡Sitio Generado con Éxito!</h2>
                <p className="text-xl text-slate-300 mb-8">
                    Tu proyecto de Rank & Rent está listo y optimizado.
                </p>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 text-left">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <List className="w-5 h-5 text-indigo-400" /> Resumen de Generación:
                    </h3>
                    <ul className="space-y-2 text-slate-300">
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> Home Page (Artisan Quality)
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> {researchData?.clusters?.length || 0} Páginas de Servicios
                        </li>
                        {formData.generateLocations && (
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-500" /> {researchData?.locations?.length || 0} Landing Pages Locales
                            </li>
                        )}
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> Configuración SEO & Schema
                        </li>
                    </ul>
                </div>

                <div className="flex justify-center gap-4">
                    <a href="/" target="_blank" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-transform hover:scale-105">
                        <Eye className="w-5 h-5" /> Ver Sitio Web
                    </a>
                    <button onClick={() => window.location.reload()} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform hover:scale-105">
                        Crear Nuevo Proyecto
                    </button>
                </div>
            </div>
        );
    }

    return null;
}