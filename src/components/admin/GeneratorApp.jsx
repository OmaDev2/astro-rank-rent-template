import React, { useState, useEffect } from 'react';
import {
    Search, MapPin, Check, Loader2, Database, Globe, AlertTriangle, ArrowLeftRight, ChevronRight, Settings, List, Eye, Cloud, Bot, Trash2, Save, Plus, X, FileText, Upload, Send, Play, ChevronDown, ChevronUp, RefreshCw, RotateCcw, Zap
} from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import KeywordReviewTable from './KeywordReviewTable';
import ClusterCard from './ClusterCard';

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
        generateLocations: false, // NUEVO: Toggle para generar páginas de localidades
        onePageMode: false, // NUEVO: Toggle para sitios de una sola página (Micro-Nicho)
        designStyle: 'industrial' // NUEVO: Estilo de diseño
    });


    const [manualMode, setManualMode] = useState(false);
    const [manualInput, setManualInput] = useState('');
    const [researchData, setResearchData] = useState(null);



    const [selectedCompetitors, setSelectedCompetitors] = useState(new Set());
    const [extractionOptions, setExtractionOptions] = useState({
        top10Only: true,  // ✅ Default to Top 10 Only (Phase 1 recommendation)
        minRelevance: 5,
        includeInfo: false,
        maxKeywords: 1000,
        specificServices: '' // ✅ New field for specific services
    });
    const [logs, setLogs] = useState([]);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [discoveredServices, setDiscoveredServices] = useState([]); // ✅ Nuevo estado para servicios
    const [richContext, setRichContext] = useState(null); // ✅ Nuevo: Deep Research Context

    // --- FUNCIÓN DE RESET ---
    const handleReset = async () => {

        if (!confirm('⚠️ ¿Estás seguro de que quieres BORRAR TODO el proyecto? \n\nEsta acción eliminará:\n- Home Page\n- Todos los servicios\n- Blog y Zonas\n- El plan actual\n\nNo se puede deshacer.')) {
            return;
        }

        try {
            setStep('loading');
            setLogs(['🗑️ Eliminando archivos...', '🧹 Limpiando directorios...']);

            const res = await fetch('/api/reset', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert('✨ Proyecto reseteado con éxito. Empezamos de cero.');
                window.location.reload();
            } else {
                throw new Error(data.errors?.join('\n') || 'Error desconocido');
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error al resetear: ' + error.message);
            setStep('input');
        }
    };

    // Auto-update seed keyword
    useEffect(() => {
        if (formData.niche && formData.city) {
            setFormData(prev => ({
                ...prev,
                seedKeyword: `${prev.niche} ${prev.city}`
            }));
        }
    }, [formData.niche, formData.city]);

    // ✅ FIX: Auto-sync Services to Home H2s when One Page Mode is enabled
    useEffect(() => {
        if (step === 'review' && formData.onePageMode && researchData?.services?.length > 0) {
            const serviceNames = researchData.services.map(s => s.name);
            const standardSections = [`¿Por qué elegirnos?`, `Zonas de Servicio`, `Preguntas Frecuentes`];

            setResearchData(prev => ({
                ...prev,
                home_structure: {
                    ...prev.home_structure,
                    // Combine Services + Standard Sections
                    h2s: [...serviceNames, ...standardSections]
                }
            }));
        }
    }, [formData.onePageMode, step, researchData?.services]);

    // ✅ FIX: Auto-populate Home Structure if missing when entering Review Step
    useEffect(() => {
        if (step === 'review' && researchData && (!researchData.home_structure?.h1)) {
            const capNiche = (formData.niche || 'Servicio').charAt(0).toUpperCase() + (formData.niche || '').slice(1);
            const capCity = (formData.city || 'Ciudad').charAt(0).toUpperCase() + (formData.city || '').slice(1);

            setResearchData(prev => ({
                ...prev,
                home_structure: {
                    h1: `Empresa de ${capNiche} en ${capCity}`,
                    h2s: [
                        `Nuestros Servicios de ${capNiche}`,
                        `¿Por qué elegirnos en ${capCity}?`,
                        `Zonas de Servicio en ${capCity}`,
                        `Presupuesto para ${capNiche}`,
                        `Preguntas Frecuentes`
                    ]
                }
            }));
        }
    }, [step, formData.niche, formData.city, researchData]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setManualInput(event.target.result);
        };
        reader.readAsText(file);
    };

    const handleManualProcess = async (e) => {
        e.preventDefault();
        if (!formData.niche || !formData.city) {
            alert('Por favor, completa Nicho y Ciudad');
            return;
        }
        if (!manualInput.trim()) {
            alert('Por favor, ingresa tus palabras clave');
            return;
        }

        setStep('loading');
        setLogs(["📝 Procesando lista manual...", "📊 Analizando volúmenes...", "✨ Preparando revisión..."]);

        try {
            const res = await fetch('/api/manual_process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: manualInput,
                    niche: formData.niche,
                    city: formData.city
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setResearchData(data);
            if (data.rich_context) {
                setRichContext(data.rich_context);
            }

            // AUTO-GENERATE HOME STRUCTURE IF MISSING (For Manual Mode)
            if (!data.home_structure || !data.home_structure.h1) {
                const capNiche = formData.niche.charAt(0).toUpperCase() + formData.niche.slice(1);
                const capCity = formData.city.split(',')[0].trim(); // Take only City part

                const defaultHome = {
                    h1: `Empresa de ${capNiche} en ${capCity}`,
                    h2s: [
                        `Servicios Profesionales de ${capNiche}`,
                        `¿Por qué contratar expertos en ${capCity}?`,
                        `Presupuesto Gratis para ${capNiche}`,
                        `Trabajos Realizados y Opiniones`,
                        `Contacta con Nosotros`
                    ],
                    seo_title: `${capNiche} en ${capCity} | Presupuestos y Precios`,
                    seo_description: `¿Buscas ${capNiche} en ${capCity}? Somos profesionales expertos. Garantizamos calidad, buen precio y rapidez. ¡Pide tu presupuesto sin compromiso hoy!`
                };

                setResearchData(prev => ({
                    ...prev,
                    home_structure: defaultHome
                }));
            }

            setStep('keywords'); // Jump directly to keywords review
        } catch (err) {
            console.error(err);
            alert(err.message);
            setStep('input');
        }
    };

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
                body: JSON.stringify({
                    niche: formData.niche.trim(),
                    city: formData.city // ✅ Pass city for Deep Research
                })
            });

            const data = await res.json();

            if (data.error) {
                console.error('❌ API Error:', data);
                throw new Error(data.error);
            }

            setDiscoveredServices(data.services || []);
            setRichContext(data.rich_context || null); // ✅ Save Context
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
                // Pre-seleccionar SOLO los recomendados
                const recommendedDomains = new Set(
                    data.raw_data.competitors
                        .filter(c => c.recommended)
                        .map(c => c.domain)
                );
                setSelectedCompetitors(recommendedDomains);
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
                    city: formData.city,
                    rich_context: richContext // ✅ Pass Rich Context
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            console.log("🛠️ DEBUG - API Cluster Response:", data);
            console.log("🛠️ DEBUG - Services found:", data.services?.length);
            console.log("🛠️ DEBUG - Blog found:", data.blog?.length);

            setResearchData(prev => ({
                ...prev,
                services: data.services?.map(s => ({
                    ...s,
                    keywords: Array.isArray(s.keywords)
                        ? s.keywords.map(k => typeof k === 'string' ? { keyword: k, volume: 0, source: 'sanitized' } : k)
                        : []
                })) || [],
                blog: data.blog || [],
                clusters: [], // Deprecated but kept to avoid undefined errors if referenced elsewhere
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
                generate_locations: formData.generateLocations, // Pasamos la config al plan
                one_page_mode: formData.onePageMode, // Pasamos el modo one page
                design_style: formData.designStyle, // Pasamos el estilo de diseño
                rich_context: richContext // ✅ Incluimos Deep Research Context explicitamente
            };

            console.log("📤 Enviando plan al servidor...", planToSave);

            const res = await fetch('/api/save_plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(planToSave)
            });

            console.log("📥 Respuesta status:", res.status);

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error ${res.status}: ${text}`);
            }

            const result = await res.json();
            console.log("📥 Respuesta JSON:", result);

            if (!result.success) throw new Error(result.error);
            return true;
        } catch (err) {
            console.error("❌ Error CRÍTICO guardando plan:", err);
            alert("Error guardando el plan: " + err.message);
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleGenerate = async () => {
        setShowConfirmModal(false);

        // Construimos el plan completo con las opciones actuales
        const fullPlan = {
            ...researchData,
            generate_locations: formData.generateLocations,
            one_page_mode: formData.onePageMode,
            design_style: formData.designStyle,
            rich_context: richContext // ✅ Incluimos Deep Research Context explicitamente
        };

        // Guardamos el plan explícitamente primero (opcional, ya que generate lo hace, pero por seguridad)
        await handleSavePlan();

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fullPlan) // ✅ ENVIAMOS EL PLAN COMPLETO CON FLAGS
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
        const servicesCount = researchData?.services?.length || 0;
        const blogCount = researchData?.blog?.length || 0;
        let keywords = 0;

        if (researchData?.services) keywords += researchData.services.reduce((sum, c) => sum + (c.keywords?.length || 0), 0);
        if (researchData?.blog) keywords += researchData.blog.reduce((sum, c) => sum + (c.keywords?.length || 0), 0);

        // Si es One Page Mode, NO sumamos los clusters (servicios) a las páginas
        const totalPages = (formData.onePageMode ? 0 : servicesCount) + blogCount + 1 + (formData.generateLocations ? (researchData.locations?.length || 0) : 0);
        return { clusters: servicesCount + blogCount, keywords, pages: totalPages };
    };

    // --- FUNCIONES DE GESTIÓN DE SERVICIOS Y BLOG ---

    const handleDeleteService = (index) => {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            const newServices = [...researchData.services];
            newServices.splice(index, 1);
            setResearchData({ ...researchData, services: newServices });
        }
    };

    const handleDeleteBlog = (index) => {
        if (confirm('¿Estás seguro de eliminar este artículo del blog?')) {
            const newBlog = [...researchData.blog];
            newBlog.splice(index, 1);
            setResearchData({ ...researchData, blog: newBlog });
        }
    };

    const handleAddService = () => {
        const name = prompt("Nombre del nuevo servicio:");
        if (name) {
            const newServices = [...(researchData.services || [])];
            newServices.push({
                name: name,
                type: 'SERVICE',
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
            setResearchData({ ...researchData, services: newServices });
        }
    };

    const handleAddBlog = () => {
        const name = prompt("Título del nuevo artículo:");
        if (name) {
            const newBlog = [...(researchData.blog || [])];
            newBlog.push({
                name: name,
                type: 'BLOG',
                intent: "INFORMATIONAL",
                main_keyword: name.toLowerCase(),
                volume: 0,
                keywords: [],
                meta_suggestions: [{
                    h1: name,
                    seo_title: `${name} - Blog`,
                    seo_description: `Artículo sobre ${name}.`
                }]
            });
            setResearchData({ ...researchData, blog: newBlog });
        }
    };

    const handleRegenerateMeta = async (clusterIndex, type = 'SERVICE') => {
        const cluster = type === 'SERVICE' ? researchData.services[clusterIndex] : researchData.blog[clusterIndex];
        setSaving(true);
        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'regenerate_meta',
                    niche: formData.niche,
                    city: formData.city,
                    cluster_name: cluster.name,
                    keywords: (cluster.keywords || []).map(k => k.keyword)
                })
            });
            const result = await res.json();
            if (result.success && result.data.meta_suggestions) {
                const newData = { ...researchData };
                if (type === 'SERVICE') {
                    newData.services[clusterIndex].meta_suggestions = result.data.meta_suggestions;
                    // Apply the first one as default if user hasn't edited much
                    newData.services[clusterIndex].h1 = result.data.meta_suggestions[0].h1;
                } else {
                    newData.blog[clusterIndex].meta_suggestions = result.data.meta_suggestions;
                    newData.blog[clusterIndex].h1 = result.data.meta_suggestions[0].h1;
                }
                setResearchData(newData);
            }
        } catch (err) {
            console.error("Error regenerating meta:", err);
        } finally {
            setSaving(false);
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
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                        <Bot className="w-6 h-6 text-indigo-400" />
                        Generador de Sitios Rank & Rent
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2 font-bold"
                            title="Resetear Proyecto (Borrar Todo)"
                        >
                            <RotateCcw className="w-5 h-5" /> REINICIAR
                        </button>
                        <button
                            onClick={() => document.getElementById('configInput').click()}
                            className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 transition-colors"
                        >
                            <Upload className="w-4 h-4" /> Cargar Config
                        </button>
                        <input type="file" id="configInput" className="hidden" accept=".json" onChange={(e) => { /* handle config upload */ }} />
                    </div>
                </div>

                {/* LOAD PLAN BUTTON */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('/api/save_plan');
                                if (!res.ok) throw new Error('No hay un plan guardado previo.');
                                let plan = await res.json();

                                // Migración 'on the fly' para planes antiguos
                                if (plan.clusters && !plan.services) {
                                    plan.services = plan.clusters;
                                    plan.blog = plan.blog || [];
                                }

                                setResearchData(plan);
                                setFormData({
                                    ...formData,
                                    niche: plan.niche,
                                    city: plan.city,
                                    generateLocations: plan.generate_locations || false,
                                    onePageMode: plan.one_page_mode || false,
                                    designStyle: plan.design_style || 'industrial'
                                });
                                setStep('review');
                            } catch (err) {
                                alert(err.message);
                            }
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2 border border-indigo-500/30 px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all"
                    >
                        <Database className="w-4 h-4" /> Cargar Último Plan Guardado
                    </button>
                </div>

                <form onSubmit={manualMode ? handleManualProcess : handleDiscoverServices} className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl space-y-6">

                    {/* MANUAL MODE TOGGLE */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setManualMode(!manualMode)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${manualMode ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                        >
                            <FileText className="w-4 h-4" />
                            {manualMode ? 'Modo Manual Activo' : 'Activar Modo Manual'}
                        </button>
                    </div>
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

                    {manualMode ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-end">
                                <label className="block text-sm font-medium text-slate-300">
                                    Paste Keywords or Upload CSV <span className="text-slate-500">(Keyword, Volume)</span>
                                </label>
                                <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                                    <Upload className="w-3 h-3" /> Upload CSV
                                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                                </label>
                            </div>
                            <textarea
                                className="w-full h-64 bg-slate-900 border border-slate-700 rounded-lg py-4 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono placeholder-slate-600"
                                placeholder={`Ejemplo CSV:\nkeyword;volumen\nalisar paredes;300\n...`}
                                value={manualInput}
                                onChange={e => setManualInput(e.target.value)}
                                required
                            />
                            <p className="text-xs text-slate-500">
                                * Detectamos automáticamente separadores como comas (,) o punto y coma (;).
                            </p>
                        </div>
                    ) : null}

                    {/* DESIGN STYLE SELECTOR */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Estilo de Diseño</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-200"
                            value={formData.designStyle || 'industrial'}
                            onChange={e => setFormData({ ...formData, designStyle: e.target.value })}
                        >
                            <option value="industrial">Industrial (Profesional - Naranja)</option>
                            <option value="corporate">Corporativo (Serio - Azul)</option>
                            <option value="nature">Naturaleza (Jardinería - Verde)</option>
                            <option value="urgent">Urgencia (Cerrajeros - Rojo)</option>
                            <option value="legal">Legal (Abogados - Navy/Oro)</option>
                            <option value="health">Salud (Clínicas - Turquesa)</option>
                            <option value="luxury">Lujo (Reformas Premium - Negro/Oro)</option>
                            <option value="beauty">Estética (Belleza - Rosa)</option>
                            <option value="tech">Tech (Informática - Violeta)</option>
                            <option value="clean_light">Clean (Limpieza - Claro/Minimal)</option>
                            <option value="clay_paper">Arcilla y Papel (Artesano Cálido)</option>
                            <option value="forest_stone">Bosque y Piedra (Artesano Natural)</option>
                            <option value="classic_workshop">Taller Clásico (Artesano Premium)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Define la paleta de colores y la tipografía global del sitio.
                        </p>
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

                    {/* One Page Mode Toggle */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <label className="flex items-center justify-between cursor-pointer">
                            <div>
                                <div className="text-sm font-medium text-slate-200">
                                    📄 Micro-Niche Mode (One Page Only)
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    Generate only the Homepage. Ideal for very specific services (e.g. "Quitar Gotelé").
                                </div>
                            </div>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={formData.onePageMode}
                                    onChange={(e) => setFormData({ ...formData, onePageMode: e.target.checked })}
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

                {richContext && (
                    <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-lg mb-6">
                        <h3 className="text-indigo-300 font-bold flex items-center gap-2 mb-2">
                            <Bot className="w-5 h-5" /> Hallazgos de Deep Research
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                            <div>
                                <span className="block text-indigo-400 font-bold text-xs uppercase">Voz del Usuario (NLP)</span>
                                {richContext.data.nlpPhrases.slice(0, 3).map((p, i) => (
                                    <div key={i}>"{p}"</div>
                                ))}
                            </div>
                            <div>
                                <span className="block text-indigo-400 font-bold text-xs uppercase">Preguntas Frecuentes</span>
                                {richContext.data.faqs.slice(0, 3).map((q, i) => (
                                    <div key={i}>• {q}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

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
                                // Seleccionar solo recomendados (o todos si se prefiere toggle)
                                const recommended = researchData.raw_data.competitors
                                    .filter(c => c.recommended)
                                    .map(c => c.domain);
                                setSelectedCompetitors(new Set(recommended));
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
                            Revisa las keywords extraídas antes de organizarlas en clusters.
                        </p>
                    </div>
                </div>

                <KeywordReviewTable
                    keywords={keywords}
                    onUpdate={(newKeywords) => {
                        setResearchData(prev => ({
                            ...prev,
                            raw_data: {
                                ...prev.raw_data,
                                top_keywords: newKeywords
                            }
                        }));
                    }}
                    onDelete={(kToDelete) => {
                        setResearchData(prev => ({
                            ...prev,
                            raw_data: {
                                ...prev.raw_data,
                                top_keywords: prev.raw_data.top_keywords.filter(k => k !== kToDelete)
                            }
                        }));
                    }}
                />

                <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-700">
                    <button
                        onClick={() => setStep('selection')}
                        className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white"
                    >
                        Atrás
                    </button>
                    <button
                        onClick={handleClusterKeywords}
                        disabled={keywords.length === 0}
                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Bot className="w-5 h-5" />
                        Generar Clusters con IA
                    </button>
                </div>
            </div>
        );
    }

    // VISTA DE REVISIÓN (STRATEGY)
    if (step === 'review' && researchData) {
        const topKeywords = researchData.raw_data?.top_keywords || [];


        const services = researchData.services || []; // Using new separated state
        const blog = researchData.blog || [];

        console.log("🛠️ DEBUG - RENDER REVIEW:", {
            step,
            hasResearchData: !!researchData,
            servicesCount: services.length,
            blogCount: blog.length,
            fullData: researchData
        });

        // Debug output
        console.log('Research Data:', researchData);
        console.log('Services:', services);



        return (
            <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-200 p-4">
                <Stepper currentStep="review" />

                {/* Header Actions */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center sticky top-2 z-50 shadow-2xl">
                    <div className="text-xs text-yellow-400 bg-black/50 p-2 rounded max-w-lg overflow-auto max-h-20">
                        DEBUG: Services found: {services?.length || 0}.
                        Has Plan: {researchData ? 'Yes' : 'No'}.
                        Keys: {Object.keys(researchData || {}).join(', ')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Estrategia SEO Generada</h2>
                        <p className="text-xs text-slate-400">{researchData.market_analysis?.substring(0, 100)}...</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* One Page Mode Toggle in Review Step */}
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-600">
                            <input
                                type="checkbox"
                                checked={formData.onePageMode}
                                onChange={(e) => setFormData({ ...formData, onePageMode: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-500 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-slate-300">One Page Mode</span>
                        </label>

                        <button onClick={handleSavePlan} disabled={saving} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar Plan
                        </button>
                        <button onClick={() => setShowConfirmModal(true)} className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                            <Check className="w-5 h-5" /> Construir Web
                        </button>
                    </div>
                </div>

                {/* HOMEPAGE STRATEGY */}
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-xl mb-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                        <FileText className="w-5 h-5 text-indigo-400" /> Configuración de la Home
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">H1 Principal (Home)</label>
                            <input
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-white font-bold focus:border-indigo-500 outline-none"
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
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">H2s (Secciones de la Home)</label>
                            <div className="space-y-2">
                                {researchData.home_structure?.h2s?.map((h2, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-300 text-sm focus:border-indigo-500 outline-none"
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
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const newH2s = [...(researchData.home_structure?.h2s || []), "Nueva Sección"];
                                        setResearchData({
                                            ...researchData,
                                            home_structure: { ...researchData.home_structure, h2s: newH2s }
                                        });
                                    }}
                                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> AÑADIR SECCIÓN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🧠 STRATEGY & CONTEXT EDITOR */}
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-xl mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" /> Estrategia de Contenido & Contexto IA
                        </h3>
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded-full font-bold">
                            MODO MEJORA MANUAL
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Pain Points */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex justify-between">
                                    Pain Points (Dolores del Cliente)
                                    <span className="text-indigo-400">¿Qué les preocupa?</span>
                                </label>
                                <div className="space-y-2">
                                    {(richContext?.data?.painPoints || []).map((point, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-xs focus:border-indigo-500 outline-none"
                                                value={point}
                                                onChange={(e) => {
                                                    const newPoints = [...richContext.data.painPoints];
                                                    newPoints[idx] = e.target.value;
                                                    setRichContext({ ...richContext, data: { ...richContext.data, painPoints: newPoints } });
                                                }}
                                            />
                                            <button onClick={() => {
                                                const newPoints = richContext.data.painPoints.filter((_, i) => i !== idx);
                                                setRichContext({ ...richContext, data: { ...richContext.data, painPoints: newPoints } });
                                            }} className="text-slate-600 hover:text-red-400"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newPoints = [...(richContext?.data?.painPoints || []), "Nuevo Pain Point"];
                                            setRichContext({ ...richContext, data: { ...richContext.data, painPoints: newPoints } });
                                        }}
                                        className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> AÑADIR PAIN POINT
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* NLP / User Intent */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex justify-between">
                                    NLP Phrases (Cómo hablan ellos)
                                    <span className="text-green-400">Jerga real</span>
                                </label>
                                <div className="space-y-2">
                                    {(richContext?.data?.nlpPhrases || []).map((phrase, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-300 text-xs focus:border-green-500 outline-none font-mono"
                                                value={phrase}
                                                onChange={(e) => {
                                                    const newPhrases = [...richContext.data.nlpPhrases];
                                                    newPhrases[idx] = e.target.value;
                                                    setRichContext({ ...richContext, data: { ...richContext.data, nlpPhrases: newPhrases } });
                                                }}
                                            />
                                            <button onClick={() => {
                                                const newPhrases = richContext.data.nlpPhrases.filter((_, i) => i !== idx);
                                                setRichContext({ ...richContext, data: { ...richContext.data, nlpPhrases: newPhrases } });
                                            }} className="text-slate-600 hover:text-red-400"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newPhrases = [...(richContext?.data?.nlpPhrases || []), "Nueva Frase NLP"];
                                            setRichContext({ ...richContext, data: { ...richContext.data, nlpPhrases: newPhrases } });
                                        }}
                                        className="text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> AÑADIR FRASE NLP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-slate-700/50 pt-6">
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-4">FAQs Base (Globales)</label>
                        <div className="grid md:grid-cols-2 gap-4">
                            {(richContext?.data?.faq || []).map((faq, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-700 space-y-2 group relative">
                                    <input
                                        className="w-full bg-transparent border-none text-white font-bold text-xs outline-none"
                                        value={faq.question}
                                        onChange={(e) => {
                                            const newFaqs = [...richContext.data.faq];
                                            newFaqs[idx].question = e.target.value;
                                            setRichContext({ ...richContext, data: { ...richContext.data, faq: newFaqs } });
                                        }}
                                    />
                                    <textarea
                                        className="w-full bg-transparent border-none text-slate-400 text-[11px] outline-none h-16 resize-none"
                                        value={faq.answer}
                                        onChange={(e) => {
                                            const newFaqs = [...richContext.data.faq];
                                            newFaqs[idx].answer = e.target.value;
                                            setRichContext({ ...richContext, data: { ...richContext.data, faq: newFaqs } });
                                        }}
                                    />
                                    <button onClick={() => {
                                        const newFaqs = richContext.data.faq.filter((_, i) => i !== idx);
                                        setRichContext({ ...richContext, data: { ...richContext.data, faq: newFaqs } });
                                    }} className="absolute top-2 right-2 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newFaqs = [...(richContext?.data?.faq || []), { question: "Nueva Pregunta", answer: "Nueva Respuesta" }];
                                    setRichContext({ ...richContext, data: { ...richContext.data, faq: newFaqs } });
                                }}
                                className="border border-dashed border-slate-700 rounded-lg p-4 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 group transition-all"
                            >
                                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase">Añadir FAQ Global</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* SERVICES GRID */}
                <div className="flex justify-between items-center mt-8">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Database className="w-5 h-5 text-indigo-400" /> Servicios Transaccionales ({services.length})
                    </h3>
                    <button onClick={handleAddService} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-indigo-500/20 transition-all">
                        <Plus className="w-4 h-4" /> Añadir Servicio
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {(services || []).map((cluster, i) => (
                        cluster ? (
                            <ClusterCard
                                key={`service-${i}`}
                                index={i}
                                cluster={{
                                    ...cluster,
                                    onMoveKeyword: (keywordToMove, fromClusterIdx, toClusterIdx) => {
                                        if (confirm(`¿Mover "${keywordToMove.keyword}" al servicio "${services[toClusterIdx].name}"?`)) {
                                            const newServices = [...researchData.services];
                                            // Remove from source
                                            if (newServices[fromClusterIdx]?.keywords) {
                                                newServices[fromClusterIdx].keywords = newServices[fromClusterIdx].keywords.filter(k => k.keyword !== keywordToMove.keyword);
                                            }
                                            // Add to target
                                            if (!newServices[toClusterIdx].keywords) newServices[toClusterIdx].keywords = [];
                                            newServices[toClusterIdx].keywords.push(keywordToMove);
                                            setResearchData({ ...researchData, services: newServices });
                                        }
                                    }
                                }}
                                allClusters={services || []}
                                onUpdate={(updatedCluster) => {
                                    const newServices = [...researchData.services];
                                    newServices[i] = updatedCluster;
                                    setResearchData({ ...researchData, services: newServices });
                                }}
                                onDelete={(idxToDelete) => handleDeleteService(idxToDelete)}
                                onRegenerateMeta={() => handleRegenerateMeta(i, 'SERVICE')}
                            />
                        ) : null
                    ))}
                    {(!services || services.length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                            <p className="text-slate-500">No hay servicios definidos.</p>
                        </div>
                    )}
                </div>

                {/* BLOG GRID */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-700">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-400" /> Blog & Contenido Informacional ({blog?.length || 0})
                    </h3>
                    <button onClick={handleAddBlog} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all">
                        <Plus className="w-4 h-4" /> Añadir Artículo
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {(blog || []).map((cluster, i) => (
                        cluster ? (
                            <ClusterCard
                                key={`blog-${i}`}
                                index={i}
                                cluster={{
                                    ...cluster,
                                    onMoveKeyword: (keywordToMove, fromClusterIdx, toClusterIdx) => {
                                        if (confirm(`¿Mover "${keywordToMove.keyword}" al artículo "${blog[toClusterIdx].name}"?`)) {
                                            const newBlog = [...researchData.blog];
                                            // Remove from source
                                            if (newBlog[fromClusterIdx]?.keywords) {
                                                newBlog[fromClusterIdx].keywords = newBlog[fromClusterIdx].keywords.filter(k => k.keyword !== keywordToMove.keyword);
                                            }
                                            // Add to target
                                            if (!newBlog[toClusterIdx].keywords) newBlog[toClusterIdx].keywords = [];
                                            newBlog[toClusterIdx].keywords.push(keywordToMove);
                                            setResearchData({ ...researchData, blog: newBlog });
                                        }
                                    }
                                }}
                                allClusters={blog || []}
                                onUpdate={(updatedCluster) => {
                                    const newBlog = [...researchData.blog];
                                    newBlog[i] = updatedCluster;
                                    setResearchData({ ...researchData, blog: newBlog });
                                }}
                                onDelete={(idxToDelete) => handleDeleteBlog(idxToDelete)}
                                onRegenerateMeta={() => handleRegenerateMeta(i, 'BLOG')}
                            />
                        ) : null
                    ))}
                    {(!blog || blog.length === 0) && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
                            <p className="text-slate-500">No hay artículos de blog definidos.</p>
                        </div>
                    )}
                </div>

                {/* LOCATIONS MANAGEMENT */}
                <div className="mt-8 bg-slate-900/80 p-6 rounded-xl border border-indigo-500/30">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                                <MapPin className="w-5 h-5" /> Estrategia de Localidades
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 px-3 py-1 rounded-full border border-slate-600 hover:border-indigo-500 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.generateLocations}
                                    onChange={(e) => setFormData({ ...formData, generateLocations: e.target.checked })}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-500"
                                />
                                <span className="text-xs font-bold text-slate-300">
                                    {formData.generateLocations ? 'Activado' : 'Desactivado'}
                                </span>
                            </label>
                        </div>

                        {formData.generateLocations && (
                            <button
                                onClick={() => {
                                    const loc = prompt("Nombre de la localidad o barrio:");
                                    if (loc && loc.trim()) {
                                        const newLocations = [...(researchData.locations || [])];
                                        newLocations.push(loc.trim());
                                        setResearchData({ ...researchData, locations: newLocations });
                                    }
                                }}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Añadir Zona
                            </button>
                        )}
                    </div>

                    {!formData.generateLocations ? (
                        <div className="text-center py-4 text-slate-500 text-sm">
                            <p>Activa esta opción para generar landing pages específicas por barrio o ciudad.</p>
                        </div>
                    ) : (!researchData.locations || researchData.locations.length === 0) ? (
                        <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
                            <p>No hay localidades definidas.</p>
                            <p className="text-sm">Añade barrios o ciudades cercanas para generar landing pages locales.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {researchData.locations.map((loc, idx) => (
                                <div key={idx} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group">
                                    <span className="text-slate-200 font-medium">{loc}</span>
                                    <button
                                        onClick={() => {
                                            const newLocations = researchData.locations.filter((_, i) => i !== idx);
                                            setResearchData({ ...researchData, locations: newLocations });
                                        }}
                                        className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
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
                            <Check className="w-4 h-4 text-green-500" /> Home Page ({formData.designStyle ? formData.designStyle.charAt(0).toUpperCase() + formData.designStyle.slice(1) : 'Industrial'} Style)
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" /> {(researchData?.services?.length || 0) + (researchData?.clusters?.length || 0)} Páginas de Servicios
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
                    <button onClick={handleReset} className="bg-slate-700 hover:bg-red-900 border border-slate-600 hover:border-red-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-colors flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" /> Borrar y Empezar de Nuevo
                    </button>
                </div>
            </div>
        );
    }

    return null;
}