import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Settings2, ChevronDown, ChevronRight } from 'lucide-react';

const CATEGORIAS = [
    { key: 'opciones_arl', label: 'ARL', color: 'indigo', defaults: [
        'Positiva Compañía de Seguros S.A.', 'ARL Sura', 'Axa Colpatria Seguros S.A.',
        'Colmena S.A. Compañía de Seguros de Vida', 'Seguros Bolívar S.A.',
        'Seguros ALFA S.A. y Seguros de Vida ALFA S.A.',
        'La Equidad Seguros Generales Organismo Cooperativo'
    ] },
    { key: 'opciones_eps', label: 'EPS', color: 'blue', defaults: [
        'EPS005 - ENTIDAD PROMOTORA DE SALUD SANITAS S.A.',
        'EPS037 - NUEVA EPS S.A - NUEVA EMPRESA PROMOTORA DE SALUD NUEVA EPS S.A',
        'EPS008 - COMPENSAR ENTIDAD PROMOTORA DE SALUD',
        'EPS010 - EPS-SURA',
        'EPS002 - SALUD TOTAL S.A. ENTIDAD PROMOTORA DE SALUD',
        'EPS016 - COOMEVA ENTIDAD PROMOTORA DE SALUD S.A.',
        'EPS018 - ENTIDAD PROMOTORA DE SALUD SERVICIO OCCIDENTAL DE SALUD S.A. S.O.S.',
        'EPS033 - SALUDVIDA S.A. ENTIDAD PROMOTORA DE SALUD',
        'COOSALUD E.S.S ARS', 'MEDIMAS EPS', 'COMPARTA E.P.S', 'MUTUAL SER',
        'CAJA DE COMPENSACION FAMILIAR C.C.F. DEL ORIENTE COLOMBIANO - COMFAORIENTE'
    ] },
    { key: 'opciones_afp', label: 'AFP (Pensiones)', color: 'purple', defaults: [
        'Administradora Colombiana de Pensiones Colpensiones', 'Porvenir', 'Protección',
        'Colfondos', 'Fondo Obligatorio de Pensiones Skandia', 'Pensiones de Antioquia'
    ] },
    { key: 'opciones_caja', label: 'Caja de Compensación', color: 'emerald', defaults: [
        'COMPENSAR', 'COMFAORIENTE', 'COLSUBSIDIO', 'CAFAM', 'COMFENALCO', 'COMFAMA', 'CAJACOPI'
    ] },
    { key: 'opciones_tipo_contrato', label: 'Tipo de Contrato', color: 'orange', defaults: [
        'Nomina', 'Prestación de servicios', 'Término Fijo', 'Término Indefinido', 'Aprendizaje', 'Obra o Labor', 'Temporal'
    ] },
    { key: 'opciones_estado', label: 'Estado del Empleado', color: 'rose', defaults: [
        'ACTIVO', 'RETIRADO', 'INACTIVO', 'EN PROCESO', 'Suspendido', 'Vacaciones', 'Licencia'
    ] },
    { key: 'opciones_pesv', label: 'PESV', color: 'teal', defaults: ['Aplicado', 'No Aplica', 'Pendiente', 'En Proceso'] },
];

const COLOR_MAP = {
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800', btn: 'bg-indigo-600 hover:bg-indigo-700' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', btn: 'bg-blue-600 hover:bg-blue-700' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800', btn: 'bg-purple-600 hover:bg-purple-700' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', btn: 'bg-emerald-600 hover:bg-emerald-700' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800', btn: 'bg-orange-600 hover:bg-orange-700' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800', btn: 'bg-rose-600 hover:bg-rose-700' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', badge: 'bg-teal-100 text-teal-800', btn: 'bg-teal-600 hover:bg-teal-700' },
};

export const cargarOpciones = (key, defaults) => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return Array.from(new Set([...defaults, ...parsed]));
            }
        }
    } catch {}
    return defaults;
};

const guardarOpciones = (key, opciones) => {
    localStorage.setItem(key, JSON.stringify(opciones));
};

const CategoriaPanel = ({ categoria }) => {
    const c = COLOR_MAP[categoria.color];
    const [opciones, setOpciones] = useState(() => cargarOpciones(categoria.key, categoria.defaults));
    const [expanded, setExpanded] = useState(false);
    const [nuevaOpcion, setNuevaOpcion] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleAgregar = (e) => {
        e.preventDefault();
        if (!nuevaOpcion.trim()) return;
        const updated = [...opciones, nuevaOpcion.trim()];
        setOpciones(updated);
        guardarOpciones(categoria.key, updated);
        setNuevaOpcion('');
    };

    const handleEliminar = (index) => {
        const updated = opciones.filter((_, i) => i !== index);
        setOpciones(updated);
        guardarOpciones(categoria.key, updated);
    };

    const handleIniciarEdicion = (index) => {
        setEditingIndex(index);
        setEditValue(opciones[index]);
    };

    const handleGuardarEdicion = () => {
        if (!editValue.trim()) return;
        const updated = opciones.map((op, i) => i === editingIndex ? editValue.trim() : op);
        setOpciones(updated);
        guardarOpciones(categoria.key, updated);
        setEditingIndex(null);
        setEditValue('');
    };

    const handleRestaurar = () => {
        if (!window.confirm(`¿Restaurar las opciones predeterminadas de "${categoria.label}"?`)) return;
        setOpciones(categoria.defaults);
        guardarOpciones(categoria.key, categoria.defaults);
    };

    return (
        <div className={`bg-white rounded-xl border ${c.border} shadow-sm overflow-hidden transition-all`}>
            <button
                onClick={() => setExpanded(p => !p)}
                className={`w-full flex items-center justify-between px-5 py-4 ${expanded ? c.bg : 'hover:bg-slate-50'} transition-colors`}
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className={`w-5 h-5 ${c.text}`} /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    <span className={`font-bold text-sm ${expanded ? c.text : 'text-slate-700'}`}>{categoria.label}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{opciones.length} opciones</span>
                </div>
                <span className="text-xs text-slate-400">Click para {expanded ? 'cerrar' : 'expandir'}</span>
            </button>

            {expanded && (
                <div className="p-5 space-y-4 border-t border-slate-100">
                    {/* Form para agregar */}
                    <form onSubmit={handleAgregar} className="flex gap-2">
                        <input
                            type="text"
                            value={nuevaOpcion}
                            onChange={e => setNuevaOpcion(e.target.value)}
                            placeholder={`Nueva opción de ${categoria.label}...`}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                        />
                        <button type="submit" className={`flex items-center gap-1.5 px-4 py-2 ${c.btn} text-white rounded-lg text-sm font-bold transition-colors`}>
                            <Plus className="w-4 h-4" /> Agregar
                        </button>
                    </form>

                    {/* Lista de opciones */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {opciones.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">No hay opciones configuradas.</p>
                        )}
                        {opciones.map((op, index) => (
                            <div key={index} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                {editingIndex === index ? (
                                    <>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editValue}
                                            onChange={e => setEditValue(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleGuardarEdicion(); if (e.key === 'Escape') setEditingIndex(null); }}
                                            className="flex-1 px-2 py-1 border border-indigo-300 rounded text-sm outline-none focus:ring-1 focus:ring-indigo-400"
                                        />
                                        <button onClick={handleGuardarEdicion} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setEditingIndex(null)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 text-sm font-medium text-slate-700">{op}</span>
                                        <button onClick={() => handleIniciarEdicion(index)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleEliminar(index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end border-t border-slate-100 pt-3">
                        <button
                            onClick={handleRestaurar}
                            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
                        >
                            Restaurar opciones predeterminadas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const GestionOpciones = () => {
    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <Settings2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gestión de Opciones</h1>
                        <p className="text-sm text-slate-500">Personaliza las opciones de los campos desplegables del sistema</p>
                    </div>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-indigo-800">
                    <strong>ℹ️ Información:</strong> Los cambios se guardan automáticamente y se reflejan en el formulario de creación de usuarios y en la hoja de vida.
                </div>

                <div className="space-y-3">
                    {CATEGORIAS.map(cat => (
                        <CategoriaPanel key={cat.key} categoria={cat} />
                    ))}
                </div>
            </div>
        </div>
    );
};
