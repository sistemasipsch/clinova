import React, { useState, useEffect } from 'react';
import { Search, Users, FileText, ArrowLeft, Download, UserCheck, UserX, Briefcase, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/api';
import { useAuth } from '../../../providers/AuthProvider';
import { exportReportToExcel } from '../../../utils/excelExporter';
import { esContratoNomina, esContratoOPS } from '../../../utils/contractUtils';

export const HojaVidaList = ({ tipoSubmodulo = 'NOMINA' }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('ACTIVO');

    const esNomina = tipoSubmodulo === 'NOMINA';
    const tituloSubmodulo = esNomina ? 'Personal de Nómina' : 'Proveedores y Contratistas (OPS)';
    const colorTema = esNomina ? 'teal' : 'indigo';

    useEffect(() => {
        const fetchPersonal = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/v1/usuarios/reportes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsuarios(response.data || []);
            } catch (err) {
                console.error("Error cargando personal para módulo Hojas de Vida:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonal();
    }, []);

    // Clasificación estandarizada por Tipo de Contrato
    const personalFiltradoPorContrato = usuarios.filter(u => {
        const tipoContrato = String(u.tipoContrato || u.hojaVida?.tipoContrato || '').trim();
        
        if (esNomina) {
            return esContratoNomina(tipoContrato) || (!esContratoOPS(tipoContrato));
        } else {
            return esContratoOPS(tipoContrato);
        }
    });

    const personalFinal = personalFiltradoPorContrato.filter(u => {
        const estUpper = (u.estado?.toUpperCase() || 'INACTIVO').trim();
        let matchEstado = true;
        
        if (filtroEstado === 'ACTIVO') {
            matchEstado = estUpper === 'ACTIVO' || estUpper === 'CONTRATADO';
        } else if (filtroEstado === 'INACTIVO') {
            matchEstado = estUpper === 'INACTIVO' || estUpper === 'DESCARTADO';
        } else if (filtroEstado === 'RETIRADO') {
            matchEstado = estUpper === 'RETIRADO';
        }

        const searchLower = searchTerm.toLowerCase();
        const matchSearch = (u.nombre || '').toLowerCase().includes(searchLower) ||
                            (u.documento || '').toLowerCase().includes(searchLower) ||
                            (u.cargo || '').toLowerCase().includes(searchLower);
        return matchEstado && matchSearch;
    });

    const totalActivos = personalFiltradoPorContrato.filter(u => {
        const e = (u.estado?.toUpperCase() || '').trim();
        return e === 'ACTIVO' || e === 'CONTRATADO';
    }).length;

    const totalInactivos = personalFiltradoPorContrato.filter(u => {
        const e = (u.estado?.toUpperCase() || '').trim();
        return e === 'INACTIVO' || e === 'DESCARTADO';
    }).length;

    const totalRetirados = personalFiltradoPorContrato.filter(u => {
        const e = (u.estado?.toUpperCase() || '').trim();
        return e === 'RETIRADO';
    }).length;

    const handleVerHojaVida = (cedula) => {
        if (esNomina) {
            navigate(`/talentoHumano/hoja-de-vida?cedula=${cedula}&submodulo=NOMINA`);
        } else {
            navigate(`/talentoHumano/hoja-de-vida?cedula=${cedula}&submodulo=PROVEEDORES`);
        }
    };

    const exportToExcel = () => {
        const headers = ['Documento', 'Nombre Completo', 'Cargo', 'Sede', 'Tipo Contrato', 'Estado'];
        const rows = personalFinal.map(u => [
            u.documento || '',
            u.nombre || '',
            u.cargo || 'N/A',
            u.sede || 'N/A',
            u.tipoContrato || (esNomina ? 'Nómina' : 'OPS / Prestación de Servicios'),
            u.estado?.toUpperCase() || 'INACTIVO'
        ]);

        exportReportToExcel({
            title: `HOJAS DE VIDA - ${tituloSubmodulo.toUpperCase()}`,
            subtitle: `Clinova IPS - Listado Oficial de Personal (${esNomina ? 'Nómina' : 'OPS/Proveedores'})`,
            sheetName: esNomina ? 'Hojas_Vida_Nomina' : 'Hojas_Vida_Proveedores',
            filename: `Hojas_Vida_${esNomina ? 'Nomina' : 'Proveedores'}_${new Date().toISOString().split('T')[0]}.xlsx`,
            headers,
            rows,
            themeColor: esNomina ? '0D9488' : '4F46E5'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Encabezado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="p-2.5 bg-white text-slate-600 hover:bg-slate-100 rounded-full shadow-sm border border-slate-200 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-0.5">
                                <span>Inicio</span> / <span>Hojas de Vida</span> / <span className="text-slate-600 font-bold">{tipoSubmodulo}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                                {esNomina ? <Users className="w-7 h-7 text-teal-600" /> : <Briefcase className="w-7 h-7 text-indigo-600" />}
                                {tituloSubmodulo}
                            </h1>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                                {esNomina ? 'Gestión de expediente laboral del personal directo' : 'Directorio de contratistas y proveedores de prestación de servicios'}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={exportToExcel}
                        disabled={loading || personalFinal.length === 0}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-4 h-4" /> Exportar a Excel
                    </button>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${esNomina ? 'bg-teal-50 text-teal-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total {esNomina ? 'Nómina' : 'Proveedores'}</p>
                            <p className="text-2xl font-black text-slate-800">{personalFiltradoPorContrato.length}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Activos</p>
                            <p className="text-2xl font-black text-slate-800">{totalActivos}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                            <UserX className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Inactivos</p>
                            <p className="text-2xl font-black text-slate-800">{totalInactivos}</p>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                            <UserX className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Retirados</p>
                            <p className="text-2xl font-black text-slate-800">{totalRetirados}</p>
                        </div>
                    </div>
                </div>

                {/* Tabla y Controles */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                        
                        {/* Selector de Estado */}
                        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                            <button 
                                onClick={() => setFiltroEstado('TODOS')}
                                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'TODOS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >Todos</button>
                            <button 
                                onClick={() => setFiltroEstado('ACTIVO')}
                                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'ACTIVO' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >Activos ({totalActivos})</button>
                            <button 
                                onClick={() => setFiltroEstado('INACTIVO')}
                                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'INACTIVO' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >Inactivos ({totalInactivos})</button>
                            <button 
                                onClick={() => setFiltroEstado('RETIRADO')}
                                className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${filtroEstado === 'RETIRADO' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >Retirados ({totalRetirados})</button>
                        </div>

                        {/* Buscador */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Buscar por nombre, cédula o cargo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Tabla de Resultados */}
                    <div className="flex-1 overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                <p className="text-xs font-bold">Cargando hojas de vida...</p>
                            </div>
                        ) : personalFinal.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                <FileText className="w-12 h-12 mb-3 opacity-30" />
                                <p className="text-sm font-bold text-slate-600">No se encontraron hojas de vida</p>
                                <p className="text-xs text-slate-400 mt-1">Intenta ajustando el filtro de búsqueda o el estado.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-5">Cédula / Documento</th>
                                        <th className="py-3.5 px-5">Nombre Completo</th>
                                        <th className="py-3.5 px-5">Cargo / Objeto</th>
                                        <th className="py-3.5 px-5">Sede</th>
                                        <th className="py-3.5 px-5 text-center">Estado</th>
                                        <th className="py-3.5 px-5 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {personalFinal.map((persona) => {
                                        const esActivo = (persona.estado?.toUpperCase() || 'INACTIVO') === 'ACTIVO';
                                        return (
                                            <tr key={persona.id || persona.documento} className="hover:bg-slate-50/80 transition-colors group">
                                                <td className="py-3.5 px-5 font-bold text-slate-700 whitespace-nowrap">
                                                    {persona.documento}
                                                </td>
                                                <td className="py-3.5 px-5 font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                                                    {persona.nombre}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-600 font-medium">
                                                    {persona.cargo || '—'}
                                                </td>
                                                <td className="py-3.5 px-5 text-slate-500 font-medium">
                                                    {persona.sede || '—'}
                                                </td>
                                                <td className="py-3.5 px-5 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${esActivo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        {esActivo ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    <button
                                                        onClick={() => handleVerHojaVida(persona.documento)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white font-bold rounded-lg text-xs transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" /> Ver Hoja de Vida
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
