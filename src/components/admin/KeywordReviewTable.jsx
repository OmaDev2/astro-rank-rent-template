import React, { useState, useMemo } from 'react';
import { Search, Trash2, Filter, TrendingUp, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';

export default function KeywordReviewTable({ keywords, onUpdate, onDelete }) {
    const [filterText, setFilterText] = useState('');
    const [minVolume, setMinVolume] = useState(0);
    const [minScore, setMinScore] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'relevanceScore', direction: 'desc' });
    const [selectedKeywords, setSelectedKeywords] = useState(new Set());

    // 1. Filtrado y Ordenación
    const filteredKeywords = useMemo(() => {
        let items = [...keywords];

        // Filtros
        items = items.filter(k =>
            k.keyword.toLowerCase().includes(filterText.toLowerCase()) &&
            (k.volume || 0) >= minVolume &&
            (k.relevanceScore || 0) >= minScore
        );

        // Ordenación
        items.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

        return items;
    }, [keywords, filterText, minVolume, minScore, sortConfig]);

    // Calcular estadísticas de la selección actual
    const stats = useMemo(() => {
        return {
            count: filteredKeywords.length,
            totalVolume: filteredKeywords.reduce((acc, k) => acc + (k.volume || 0), 0),
            avgScore: filteredKeywords.length > 0
                ? (filteredKeywords.reduce((acc, k) => acc + (k.relevanceScore || 0), 0) / filteredKeywords.length).toFixed(1)
                : 0
        };
    }, [filteredKeywords]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const toggleSelectAll = () => {
        if (selectedKeywords.size === filteredKeywords.length) {
            setSelectedKeywords(new Set());
        } else {
            setSelectedKeywords(new Set(filteredKeywords.map(k => k.keyword)));
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`¿Eliminar ${selectedKeywords.size} keywords seleccionadas?`)) {
            const remaining = keywords.filter(k => !selectedKeywords.has(k.keyword));
            onUpdate(remaining);
            setSelectedKeywords(new Set());
        }
    };

    return (
        <div className="space-y-4">

            {/* 📊 Control Bar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-wrap gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar keyword..."
                        value={filterText}
                        onChange={e => setFilterText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-slate-400 uppercase font-bold">Filtros</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">Min Vol:</span>
                        <input
                            type="number"
                            value={minVolume}
                            onChange={e => setMinVolume(Number(e.target.value))}
                            className="w-16 bg-slate-800 border-slate-700 rounded px-2 py-1 text-xs"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300">Min Score:</span>
                        <select
                            value={minScore}
                            onChange={e => setMinScore(Number(e.target.value))}
                            className="bg-slate-800 border-none rounded text-xs py-1"
                        >
                            <option value="0">Todos</option>
                            <option value="3">3+</option>
                            <option value="5">5+ (Bueno)</option>
                            <option value="8">8+ (Top)</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400 text-xs">Keywords Visibles</span>
                        <span className="font-bold text-white">{stats.count}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400 text-xs">Volumen Total</span>
                        <span className="font-bold text-green-400">{stats.totalVolume.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedKeywords.size > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-2 rounded-lg flex justify-between items-center px-4 animate-fade-in">
                    <span className="text-red-200 text-sm font-medium">
                        {selectedKeywords.size} keywords seleccionadas
                    </span>
                    <button
                        onClick={handleBulkDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> Eliminar Selección
                    </button>
                </div>
            )}

            {/* 📋 Table */}
            <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-inner">
                <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-400 sticky top-0 z-10 shadow-md">
                            <tr>
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedKeywords.size === filteredKeywords.length && filteredKeywords.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0"
                                    />
                                </th>
                                <th onClick={() => handleSort('keyword')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                                    <div className="flex items-center gap-1">
                                        Keyword
                                        {sortConfig.key === 'keyword' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('volume')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-green-500" /> Vol
                                        {sortConfig.key === 'volume' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('cpc')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                                    <div className="flex items-center gap-1">
                                        CPC
                                        {sortConfig.key === 'cpc' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('competition')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                                    <div className="flex items-center gap-1">
                                        KD
                                        {sortConfig.key === 'competition' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th onClick={() => handleSort('relevanceScore')} className="p-4 cursor-pointer hover:text-white transition-colors group">
                                    <div className="flex items-center gap-1">
                                        Score
                                        {sortConfig.key === 'relevanceScore' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="p-4">Fuente</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredKeywords.map((k, idx) => {
                                const isSelected = selectedKeywords.has(k.keyword);
                                return (
                                    <tr
                                        key={idx}
                                        className={`group transition-all ${isSelected ? 'bg-indigo-900/20' : 'hover:bg-slate-800/50'}`}
                                        onClick={() => {
                                            const newSet = new Set(selectedKeywords);
                                            if (newSet.has(k.keyword)) newSet.delete(k.keyword);
                                            else newSet.add(k.keyword);
                                            setSelectedKeywords(newSet);
                                        }}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }} // Handled by tr click
                                                className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-0"
                                            />
                                        </td>
                                        <td className="p-4 font-medium text-white group-hover:text-indigo-300 transition-colors">
                                            {k.keyword}
                                            {k.relevanceReasons && k.relevanceReasons.length > 0 && (
                                                <div className="text-[10px] text-slate-500 mt-0.5 flex gap-1 flex-wrap">
                                                    {k.relevanceReasons.slice(0, 2).map((r, i) => (
                                                        <span key={i} className="bg-slate-800 px-1 rounded border border-slate-700">{r}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono">
                                            {k.volume > 0 ? k.volume.toLocaleString() : <span className="text-slate-600">-</span>}
                                        </td>
                                        <td className="p-4 text-slate-300 font-mono text-xs">
                                            {k.cpc > 0 ? `$${k.cpc.toFixed(2)}` : '-'}
                                        </td>
                                        <td className="p-4">
                                            {k.competition !== undefined && k.competition >= 0 ? (
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${k.competition < 15 ? 'bg-green-500/20 text-green-400' :
                                                        k.competition < 30 ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    KD {k.competition}
                                                </span>
                                            ) : (
                                                <span className="text-slate-600 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-slate-800 rounded-full h-1.5 w-16 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${k.relevanceScore >= 8 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                                            k.relevanceScore >= 5 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                                                                'bg-slate-600'
                                                            }`}
                                                        style={{ width: `${(k.relevanceScore / 10) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-bold ${k.relevanceScore >= 8 ? 'text-green-400' :
                                                    k.relevanceScore >= 5 ? 'text-blue-400' :
                                                        'text-slate-500'
                                                    }`}>
                                                    {k.relevanceScore}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${k.source?.includes('competitor') ? 'bg-purple-900/30 text-purple-300 border-purple-800' :
                                                k.source?.includes('suggestion') ? 'bg-cyan-900/30 text-cyan-300 border-cyan-800' :
                                                    'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                {k.source || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(k);
                                                }}
                                                className="text-slate-600 hover:text-red-400 p-2 rounded-full hover:bg-slate-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredKeywords.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p>No se encontraron keywords con estos filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
