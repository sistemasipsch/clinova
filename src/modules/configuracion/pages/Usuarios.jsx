import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Settings, ChevronLeft, ChevronRight, IdCard, Filter, Plus, UserPlus, FileText, User as UserIcon, Briefcase, Eye, BarChart2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateUsuario } from '../components/CreateUsuario';
import { UserDetailModal } from '../components/UserDetailModal';
import { UserDocumentStatsModal } from '../components/UserDocumentStatsModal';
import { UsuariosService } from '../services/usuarios.service';
import { useAlert } from '../../../providers/AlertProvider'; 

const TIPO_DOC_MAP = {
    1: 'CC',
    2: 'TI',
    3: 'CE',
    4: 'PA'
};

export const Usuarios = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert(); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    
    const [userToEdit, setUserToEdit] = useState(null);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await UsuariosService.getAll();
            const usuariosReales = Array.isArray(data) ? data : (data?.data || []);
            setUsers(usuariosReales);
        } catch (error) {
            console.error("Failed to fetch users", error);
            showAlert({ message: 'Error al cargar la lista de usuarios', status: 'error' });
            setUsers([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getNombre = (u) => u?.persona?.primerNombre ? `${u.persona.primerNombre} ${u.persona.segundoNombre || ''}`.trim() : (u?.nombres || u?.nombre || u?.hojaVida?.nombres || u?.username || '');
    const getApellido = (u) => u?.persona?.primerApellido ? `${u.persona.primerApellido} ${u.persona.segundoApellido || ''}`.trim() : (u?.apellidos || u?.hojaVida?.apellidos || '');
    const getDoc = (u) => u?.persona?.numeroDocumento || u?.hojaVida?.cedula || u?.documento || u?.username || '';
    const getCargo = (u) => (typeof u?.cargo === 'object' ? u?.cargo?.nombre : u?.cargo) || u?.hojaVida?.cargos?.[0]?.nombre || u?.rol || 'Sin Cargo';

    const filteredData = useMemo(() => {
        if (!users || !Array.isArray(users)) return [];
        const search = searchTerm.toLowerCase().trim();
        if (!search) return users;
        return users.filter(user => {
            const nombreStr = `${getNombre(user)} ${getApellido(user)}`.toLowerCase();
            const docStr = getDoc(user).toString().toLowerCase();
            const roleStr = (user.rol || '').toLowerCase();
            const cargoStr = getCargo(user).toLowerCase();
            const usernameStr = (user.username || '').toLowerCase();

            return nombreStr.includes(search) || docStr.includes(search) || roleStr.includes(search) || cargoStr.includes(search) || usernameStr.includes(search);
        });
    }, [searchTerm, users]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    const handleViewStats = (user) => {
        setSelectedUser(user);
        setIsStatsModalOpen(true);
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`¿Está seguro de eliminar al usuario "${user.username}"?`)) return;
        try {
            await UsuariosService.deleteUser(user.id);
            showAlert({ message: 'Usuario eliminado exitosamente', status: 'success' });
            fetchUsers();
        } catch (error) {
            console.error("Error al eliminar usuario", error);
            showAlert({ message: error?.response?.data?.message || 'Error al eliminar usuario', status: 'error' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Administre las cuentas de usuario ({users.length} usuarios registrados en el sistema).
                    </p>
                </div>
                <button
                    onClick={() => {
                        setUserToEdit(null);
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Nuevo Usuario</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, documento, cargo o rol..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>Mostrar por página:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-slate-50 border border-slate-200 rounded-md py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value={500}>500</option>
                                <option value={2000}>Todos ({filteredData.length})</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo Doc</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No. Documento</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombres</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Apellidos</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol / Cargo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="animate-pulse flex flex-col items-center justify-center gap-2">
                                            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p>Cargando usuarios desde el servidor...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((user) => (
                                    <tr key={user.id || user.username} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                {TIPO_DOC_MAP[user.persona?.tipoDocumento] || user.persona?.tipoDocumento || 'CC'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <IdCard className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm font-medium">{getDoc(user)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase overflow-hidden">
                                                    {user.hojaVida?.fotoUrl ? (
                                                        <img src={`http://localhost:8080${user.hojaVida.fotoUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        (getNombre(user)?.[0] || 'U')
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">
                                                    {getNombre(user)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-700">
                                                {getApellido(user) || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    user.rol === 'HR_MANAGER' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                        'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {getCargo(user)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Ver detalle completo"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewStats(user)}
                                                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                    title="Estadísticas documentales"
                                                >
                                                    <BarChart2 className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setUserToEdit(user);
                                                        setIsCreateModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all text-xs font-semibold px-2"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Eliminar usuario"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Filter className="w-8 h-8 opacity-20" />
                                            <p>No se encontraron usuarios.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando <span className="font-medium text-slate-900">{filteredData.length > 0 ? startIndex + 1 : 0}</span> a <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de <span className="font-medium text-slate-900">{filteredData.length}</span> resultados
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                                .map((page, index, array) => (
                                    <div key={page} className="flex items-center">
                                        {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-slate-400">...</span>}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`
                                                min-w-[32px] h-8 flex items-center justify-center rounded-md text-sm font-medium transition-all mx-0.5
                                                ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                                            `}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                ))
                            }
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <CreateUsuario
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setUserToEdit(null);
                }}
                onSaved={fetchUsers}
                editData={userToEdit}
            />

            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUser}
            />

            <UserDocumentStatsModal
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};