import React, { useState } from 'react';
import { Trash2, Plus, MoveRight, ChevronDown, ChevronUp, Bot, FileText } from 'lucide-react';

export default function ClusterCard({ cluster, index, allClusters, onUpdate, onDelete, onRegenerateMeta }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [newKeyword, setNewKeyword] = useState('');
    const [selectedKeywords, setSelectedKeywords] = useState(new Set());

    const handleNameChange = (e) => {
        onUpdate({ ...cluster, name: e.target.value });
    };

    // ✅ FIX: Auto-populate fields from suggestions if missing on mount
    React.useEffect(() => {
        if (cluster?.meta_suggestions?.length > 0) {
            const defaultMeta = cluster.meta_suggestions[0];
            const updates = {};
            let hasUpdates = false;

            if (!cluster.h1 && defaultMeta?.h1) {
                updates.h1 = defaultMeta.h1;
                hasUpdates = true;
            }
            if (!cluster.seo_title && defaultMeta?.seo_title) {
                updates.seo_title = defaultMeta.seo_title;
                hasUpdates = true;
            }
            if (!cluster.seo_description && defaultMeta?.seo_description) {
                updates.seo_description = defaultMeta.seo_description;
                hasUpdates = true;
            }

            if (hasUpdates) {
                // Use setTimeout to avoid render-cycle conflicts
                setTimeout(() => onUpdate({ ...cluster, ...updates }), 0);
            }
        }
    }, [cluster?.name]); // Run when cluster changes (or mounts)

    const handleMetaSelect = (e) => {
        const idx = parseInt(e.target.value);
        if (cluster?.meta_suggestions && cluster.meta_suggestions[idx]) {
            const suggestion = cluster.meta_suggestions[idx];
            onUpdate({
                ...cluster,
                selected_suggestion: idx,
                h1: suggestion.h1,
                seo_title: suggestion.seo_title,
                seo_description: suggestion.seo_description
            });
        }
    };

    const handleAddKeyword = () => {
        if (!newKeyword.trim()) return;
        const updatedKeywords = [...(cluster?.keywords || []), {
            keyword: newKeyword.trim(),
            volume: 0,
            source: 'manual'
        }];
        onUpdate({ ...cluster, keywords: updatedKeywords });
        setNewKeyword('');
    };

    const handleDeleteSelectedKeywords = () => {
        if (confirm(`¿Eliminar ${selectedKeywords.size} keywords de este cluster?`)) {
            const updatedKeywords = (cluster?.keywords || []).filter((_, idx) => !selectedKeywords.has(idx));
            onUpdate({ ...cluster, keywords: updatedKeywords });
            setSelectedKeywords(new Set());
        }
    };

    const handleMoveKeyword = (keywordObj, targetClusterIndex) => {
        // This callback needs to be handled by the parent because it involves TWO clusters
        // But here we can just fire a specific event if we want, 
        // OR we can't easily do it if onUpdate only updates THIS cluster.
        // Actually, the parent needs to handle the move.
        // Let's pass a special prop `onMoveKeyword` to the component.
    };

    // Helper colors
    const getScoreColor = (val, type) => {
        if (type === 'cpc') return (!val || val < 1) ? 'text-green-400' : 'text-slate-400';
        if (type === 'comp') return (!val || val < 0.3) ? 'text-green-400' : 'text-yellow-400';
        return 'text-slate-400';
    };

    if (!cluster) return null; // Safety check

    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl transition-all hover:border-slate-600 group">

            {/* 🏷️ Header */}
            <div className="bg-slate-900/50 p-4 flex justify-between items-start border-b border-slate-700">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-indigo-500/30">
                            CLUSTER {index + 1}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                            Vol: <span className="text-green-400 font-bold">{cluster.volume || 0}</span>
                        </span>
                    </div>
                    <input
                        className="bg-transparent text-lg font-bold text-white border-none outline-none focus:ring-0 p-0 w-full placeholder-slate-600"
                        value={cluster.name || ''}
                        onChange={handleNameChange}
                        placeholder="Nombre del Cluster"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => onDelete(index)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-700 transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-5 grid lg:grid-cols-2 gap-6">

                    {/* 📝 Left: Meta Data & SEO */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 mb-2">
                            <FileText className="w-4 h-4" />
                            <h4 className="text-sm font-bold uppercase">Contenido & Meta</h4>
                        </div>

                        {/* Suggestions */}
                        {cluster.meta_suggestions && cluster.meta_suggestions.length > 0 && (
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
                                        <Bot className="w-3 h-3" /> Sugerencias IA
                                    </label>
                                    <button
                                        onClick={onRegenerateMeta}
                                        className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 hover:bg-indigo-500/40 transition-colors"
                                        title="Regenerar sugerencias basadas en las keywords actuales"
                                    >
                                        REGENERAR
                                    </button>
                                </div>
                                <select
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
                                    value={cluster.selected_suggestion || 0}
                                    onChange={handleMetaSelect}
                                >
                                    {cluster.meta_suggestions.map((_, idx) => (
                                        <option key={idx} value={idx}>Variación {idx + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Fields */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">H1 Header</label>
                                <input
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white font-bold text-sm focus:border-indigo-500 outline-none transition-colors"
                                    value={cluster.h1 || cluster.meta_suggestions?.[0]?.h1 || ''}
                                    onChange={(e) => onUpdate({ ...cluster, h1: e.target.value })}
                                    placeholder="Título Principal de la Página"
                                />
                            </div>

                            <div className="bg-black/20 p-3 rounded border border-slate-700/50">
                                <label className="text-[10px] font-bold text-blue-400 uppercase block mb-1">SEO Title (Google Preview)</label>
                                <input
                                    className="w-full bg-transparent border-none outline-none text-sm text-blue-400 font-medium truncate placeholder-blue-900/50"
                                    value={cluster.seo_title || cluster.meta_suggestions?.[0]?.seo_title || ''}
                                    onChange={(e) => onUpdate({ ...cluster, seo_title: e.target.value })}
                                    placeholder="Título SEO Azul"
                                />
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mt-2 mb-1">Meta Description</label>
                                <textarea
                                    className="w-full bg-transparent border-none outline-none text-xs text-slate-400 resize-none h-12 placeholder-slate-700"
                                    value={cluster.seo_description || cluster.meta_suggestions?.[0]?.seo_description || ''}
                                    onChange={(e) => onUpdate({ ...cluster, seo_description: e.target.value })}
                                    placeholder="Descripción que aparecerá en Google..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 🔑 Right: Keywords */}
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                Keywords ({cluster.keywords?.length || 0})
                            </span>
                            {selectedKeywords.size > 0 && (
                                <button
                                    onClick={handleDeleteSelectedKeywords}
                                    className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Borrar ({selectedKeywords.size})
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-900 border border-slate-700 rounded-lg flex-1 overflow-hidden flex flex-col min-h-[200px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 bg-slate-800/50 p-2 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-6">Keyword</div>
                                <div className="col-span-2 text-right">Vol</div>
                                <div className="col-span-3 text-center">Mover</div>
                            </div>

                            {/* Table Body */}
                            <div className="overflow-y-auto max-h-[240px] scrollbar-thin scrollbar-thumb-slate-700">
                                {(cluster.keywords || []).map((k, idx) => (
                                    <div key={idx} className="grid grid-cols-12 p-2 text-xs border-b border-slate-800 hover:bg-slate-800/50 group/row items-center">
                                        <div className="col-span-1 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedKeywords.has(idx)}
                                                onChange={(e) => {
                                                    const newSet = new Set(selectedKeywords);
                                                    if (e.target.checked) newSet.add(idx);
                                                    else newSet.delete(idx);
                                                    setSelectedKeywords(newSet);
                                                }}
                                                className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0"
                                            />
                                        </div>
                                        <div className="col-span-6 font-medium text-slate-300 truncate pr-2" title={k?.keyword || ''}>
                                            {k?.keyword || '...'}
                                        </div>
                                        <div className="col-span-2 text-right font-mono text-slate-400">
                                            {k?.volume || '-'}
                                        </div>
                                        <div className="col-span-3 text-center">
                                            <select
                                                className="bg-slate-800 text-[10px] border border-slate-600 rounded text-slate-400 outline-none focus:border-indigo-500 w-full"
                                                value={index}
                                                onChange={(e) => {
                                                    const targetIdx = parseInt(e.target.value);
                                                    if (targetIdx !== index) {
                                                        if (cluster.onMoveKeyword) {
                                                            cluster.onMoveKeyword(k, index, targetIdx);
                                                        }
                                                    }
                                                }}
                                            >
                                                <option value={index}>--</option>
                                                {(allClusters || []).map((c, cidx) => (
                                                    cidx !== index && <option key={cidx} value={cidx}>→ {c?.name?.substring(0, 10)}..</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Keyword Input */}
                            <div className="p-2 border-t border-slate-700 bg-slate-800/30 flex gap-2">
                                <input
                                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                                    placeholder="Nueva keyword..."
                                    value={newKeyword}
                                    onChange={e => setNewKeyword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddKeyword()}
                                />
                                <button
                                    onClick={handleAddKeyword}
                                    disabled={!newKeyword.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs font-bold disabled:opacity-50"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
