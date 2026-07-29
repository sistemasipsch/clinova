import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, User, Users, ArrowLeft, FileText, Trash2, Edit2, Save, X, Eye, Upload, Folder, Plus, DownloadCloud, AlertCircle, AlertTriangle, Calendar, Award, CheckCircle, MapPin, BookOpen, Clock, Syringe, Loader2, ChevronDown, ChevronRight, Settings, History, GripVertical, Briefcase } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import http from '../../../services/httpClient';
import { useAlert } from '../../../providers/AlertProvider';
import { useAuth } from '../../../providers/AuthProvider';
import { cursosService } from '../services/cursos.service';
import SecureImage from '../../../components/SecureImage';
import { API_BASE_URL } from '../../../config/api';
import { TrazabilidadPanel } from '../../../components/TrazabilidadPanel';
import { esContratoNomina, esContratoOPS } from '../../../utils/contractUtils';
import { resolveOptionLabel } from '../../../utils/optionResolver';

export const HojaVida = ({ tipoSubmodulo = null }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    
    const authorities = useMemo(() => user?.authorities || user?.permisos || [], [user]);
    const roleString = useMemo(() => String(user?.rol || user?.role || '').toUpperCase(), [user]);
    
    const isAdminOrHR = useMemo(() => 
        authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN') ||
        authorities.includes('ROLE_HR_MANAGER') || authorities.includes('HR_MANAGER') ||
        roleString.includes('ADMIN') || roleString.includes('HR_MANAGER'), 
    [authorities, roleString]);

    const isStandardUser = !isAdminOrHR;
    const userCedula = useMemo(() => user?.numeroDocumento || user?.persona?.numeroDocumento || user?.sub || user?.username || '', [user]);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('datos');
    const [hojaVidaId, setHojaVidaId] = useState(null);
    const [cvNombre, setCvNombre] = useState('');
    const [usuarioHabilitado, setUsuarioHabilitado] = useState(false);
    const [advertenciaTipoContrato, setAdvertenciaTipoContrato] = useState(null);

    const [catalogoVacunasGlobal, setCatalogoVacunasGlobal] = useState([]);
    const [categoriasSoportes, setCategoriasSoportes] = useState([]);
    const [catalogoCargos, setCatalogoCargos] = useState([]);
    const [catalogoSedes, setCatalogoSedes] = useState([]);

    const [datosCV, setDatosCV] = useState({
        cedula: '', nombres: '', apellidos: '', fechaNacimiento: '', direccionResidencia: '',
        telefono: '', correoElectronico: '', contactoEmergencia: '', telefonoContactoEmergencia: '', 
        arl: '', eps: '', afp: '', cajaCompensacion: '', fechaIngreso: '', tipoContrato: '', 
        sedeId: '', cargoId: '', salario: '', subsidioTransporte: '', estado: '', 
        fechaRetiro: '', motivoRetiro: '', usuarioId: '', perfilVacunacion: '', detalleVacunas: [],
        fotoUrl: ''
    });
    
    const [resultadosIA, setResultadosIA] = useState([]);
    const [editingDocId, setEditingDocId] = useState(null);
    const [editDocValue, setEditDocValue] = useState('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [docToReject, setDocToReject] = useState(null);
    const [rejectData, setRejectData] = useState({ motivo: '', fechaLimite: '' });

    const [cursosAsignados, setCursosAsignados] = useState([]);
    const [catalogoCursos, setCatalogoCursos] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [nuevoCursoMaestro, setNuevoCursoMaestro] = useState({ nombre: '', descripcion: '', fechaLimiteGlobal: '', esGlobal: true, mesesVigencia: 12 });
    const [datosAsignacion, setDatosAsignacion] = useState({ cursoMaestroId: '' });

    const [expandedCategories, setExpandedCategories] = useState({});
    const [draggingCategory, setDraggingCategory] = useState(null);
    const [historialHV, setHistorialHV] = useState([]);
    const [loadingHistorialHV, setLoadingHistorialHV] = useState(false);
    const [historialHVNoDisponible, setHistorialHVNoDisponible] = useState(false);

    const [showGestionCarpetasModal, setShowGestionCarpetasModal] = useState(false);
    const [nuevaCarpetaNombre, setNuevaCarpetaNombre] = useState('');

    const vacunasPerfil = useMemo(() => catalogoVacunasGlobal.filter(v => v.perfil === datosCV.perfilVacunacion), [catalogoVacunasGlobal, datosCV.perfilVacunacion]);

    const cargarVacunas = useCallback(async () => {
        try {
            const res = await http.get('/vacunacion/catalogo');
            let data = res.data || res;
            if (!Array.isArray(data)) data = data?.content || [];
            if (!Array.isArray(data)) data = [];
            setCatalogoVacunasGlobal(data);
        } catch (e) {}
    }, []);

    const cargarCategoriasSoportes = useCallback(async () => {
        try {
            const data = await http.get('/categorias-soportes');
            const nombres = Array.isArray(data) ? data.map(c => c.nombre || c) : [];
            if (nombres.length === 0) {
                setCategoriasSoportes(["Acta de grado Profesional", "Cédula de ciudadanía", "Otros Soportes"]);
            } else {
                setCategoriasSoportes(nombres);
            }
        } catch (e) {
            setCategoriasSoportes(["Acta de grado Profesional", "Cédula de ciudadanía", "Otros Soportes"]);
        }
    }, []);

    const cargarCargosSedes = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const resCargos = await axios.get(`${API_BASE_URL}/api/v1/cargos`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setCatalogoCargos(resCargos.data || []);
            const resSedes = await http.get('/sedes');
            setCatalogoSedes(Array.isArray(resSedes) ? resSedes : (resSedes?.data || []));
        } catch (e) {}
    }, []);

    useEffect(() => {
        cargarVacunas();
        cargarCategoriasSoportes();
        cargarCargosSedes();
    }, [cargarVacunas, cargarCategoriasSoportes, cargarCargosSedes]);

    useEffect(() => {
        if (isStandardUser && userCedula) {
            setSearchTerm(userCedula);
            fetchHojaVida(userCedula);
        }
    }, [isStandardUser, userCedula]);

    const cargarCursosAsignados = useCallback(async () => {
        const uid = datosCV.usuarioId;
        const hdvId = hojaVidaId;
        if (!uid && !hdvId) return;
        try {
            let res = null;
            if (uid) {
                try {
                    res = await cursosService.listarAsignados(uid);
                } catch (e) {
                    // Ignorar error si no hay usuario asignado aún
                }
            }
            if ((!res || !Array.isArray(res) || res.length === 0) && hdvId) {
                try {
                    res = await http.get(`/cursos/hoja-vida/${hdvId}`);
                } catch (e) {
                    // Ignorar error si el endpoint o la hoja de vida no tienen cursos
                }
            }
            const lista = Array.isArray(res) ? res : (res?.data || []);
            setCursosAsignados(lista);
        } catch (error) {
            console.error("Error cargando cursos asignados:", error);
            setCursosAsignados([]);
        }
    }, [hojaVidaId, datosCV.usuarioId]);

    const cargarCatalogoCursos = useCallback(async () => {
        try {
            const res = await cursosService.listarCatalogo();
            setCatalogoCursos(res.data || res || []);
        } catch (error) {}
    }, []);

    useEffect(() => {
        if (activeTab === 'cursos' && datosCV.usuarioId) {
            cargarCursosAsignados();
        }
    }, [activeTab, datosCV.usuarioId, cargarCursosAsignados]);

    useEffect(() => {
        if (activeTab !== 'trazabilidad' || !hojaVidaId) return;
        setLoadingHistorialHV(true);
        setHistorialHV([]);
        setHistorialHVNoDisponible(false);
        http.get(`/hojas-vida/${hojaVidaId}/historial`)
            .then(res => {
                const data = res?.data?.data || res?.data || res || [];
                setHistorialHV(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                if (err?.response?.status === 404) {
                    setHistorialHVNoDisponible(true);
                }
                setHistorialHV([]);
            })
            .finally(() => setLoadingHistorialHV(false));
    }, [activeTab, hojaVidaId]);

    const fetchHojaVida = async (cedula) => {
        const cedulaTrim = cedula.trim();
        if (!cedulaTrim) return;

        try {
            const data = await http.get(`/hojas-vida/cedula/${cedulaTrim}`);
            if (data) {
                const hv = data.data || data; 
                setHojaVidaId(hv.id);
                setUsuarioHabilitado(true);
                
                let parsedVacunas = [];
                if (hv.detalleVacunas) {
                    try { 
                        parsedVacunas = JSON.parse(hv.detalleVacunas); 
                        parsedVacunas = parsedVacunas.map(v => ({
                            nombre: v.nombre, 
                            dosisRequeridas: v.dosisRequeridas || 1, 
                            fechas: v.fechas || [v.fechaAplicacion || ""], 
                            requiereRefuerzo: v.requiereRefuerzo || false, 
                            fechaRefuerzo: v.fechaRefuerzo || ""
                        }));
                    } catch(e) {}
                }

                let freshPerfil = hv.perfilVacunacion || '';
                let freshNombres = hv.nombres || '';
                let freshApellidos = hv.apellidos || '';
                let freshCorreo = hv.correoElectronico || '';
                let freshCargoId = hv.cargos?.[0]?.id || '';
                let foundUserObj = null;

                if (isStandardUser) {
                    const p = user?.persona || {};
                    freshPerfil = p.perfilVacunacion || freshPerfil;
                    freshNombres = `${p.primerNombre || ''} ${p.segundoNombre || ''}`.trim() || freshNombres;
                    freshApellidos = `${p.primerApellido || ''} ${p.segundoApellido || ''}`.trim() || freshApellidos;
                    freshCorreo = p.correoElectronico || user?.email || freshCorreo;
                    freshCargoId = user?.cargo?.id || freshCargoId;
                } else {
                    try {
                        foundUserObj = await http.get(`/usuarios/documento/${cedulaTrim}`).catch(() => null);
                        if (foundUserObj) {
                            const p = foundUserObj.persona || {};
                            freshPerfil = p.perfilVacunacion || freshPerfil;
                            freshNombres = `${p.primerNombre || ''} ${p.segundoNombre || ''}`.trim() || freshNombres;
                            freshApellidos = `${p.primerApellido || ''} ${p.segundoApellido || ''}`.trim() || freshApellidos;
                            freshCorreo = p.correoElectronico || foundUserObj.username || freshCorreo;
                            freshCargoId = foundUserObj.cargo?.id || freshCargoId;
                        }
                    } catch (err) {}
                }

                let freshSedeId = hv.sedes?.[0]?.id || foundUserObj?.sede?.id || foundUserObj?.hojaVida?.sedes?.[0]?.id || '';

                setCvNombre(`${freshNombres} ${freshApellidos}`);
                setDatosCV({
                    cedula: hv.cedula || '', nombres: freshNombres, apellidos: freshApellidos, fechaNacimiento: hv.fechaNacimiento || '', 
                    direccionResidencia: hv.direccionResidencia || '', telefono: hv.telefono || '', correoElectronico: freshCorreo, 
                    contactoEmergencia: hv.contactoEmergencia || '', telefonoContactoEmergencia: hv.telefonoContactoEmergencia || '', 
                    arl: hv.arl || '', eps: hv.eps || '', afp: hv.afp || '', cajaCompensacion: hv.cajaCompensacion || '',
                    fechaIngreso: hv.fechaIngreso || '', tipoContrato: hv.tipoContrato || foundUserObj?.tipoContrato || '', sedeId: freshSedeId, 
                    cargoId: freshCargoId, salario: hv.salario || '', subsidioTransporte: hv.subsidioTransporte || '',
                    estado: hv.estado || '', fechaRetiro: hv.fechaRetiro || '', motivoRetiro: hv.motivoRetiro || '', usuarioId: hv.usuarioId || foundUserObj?.id || '', 
                    perfilVacunacion: freshPerfil, detalleVacunas: parsedVacunas,
                    fotoUrl: hv.fotoUrl ? `${API_BASE_URL}${hv.fotoUrl}?t=${Date.now()}` : ''
                });

                // Validar pertenencia a Nómina vs. OPS usando el resolvedor estandarizado
                const rawContratoStr = String(hv.tipoContrato || foundUserObj?.tipoContrato || foundUserObj?.hojaVida?.tipoContrato || '').trim();
                const esNominaUser = esContratoNomina(rawContratoStr);
                const esOpsUser = esContratoOPS(rawContratoStr);

                const activeSubmodulo = searchParams.get('submodulo') || tipoSubmodulo;

                if (activeSubmodulo === 'NOMINA' && esOpsUser && !esNominaUser) {
                    setAdvertenciaTipoContrato({
                        tipoEsperado: 'NÓMINA',
                        tipoEncontrado: 'PROVEEDORES / OPS',
                        nombre: `${freshNombres} ${freshApellidos}`,
                        cedula: cedulaTrim,
                        targetRoute: `/talentoHumano/hoja-de-vida?cedula=${cedulaTrim}&submodulo=PROVEEDORES`
                    });
                    showAlert({ 
                        message: `⚠️ ATENCIÓN: El usuario ${freshNombres} ${freshApellidos} (CC ${cedulaTrim}) está registrado como PROVEEDOR (OPS / Prestación de Servicios). Para modificar su perfil debes estar en el submódulo de Proveedores.`, 
                        status: 'warning' 
                    });
                } else if (activeSubmodulo === 'PROVEEDORES' && esNominaUser && !esOpsUser) {
                    setAdvertenciaTipoContrato({
                        tipoEsperado: 'PROVEEDORES (OPS)',
                        tipoEncontrado: 'NÓMINA',
                        nombre: `${freshNombres} ${freshApellidos}`,
                        cedula: cedulaTrim,
                        targetRoute: `/talentoHumano/hoja-de-vida?cedula=${cedulaTrim}&submodulo=NOMINA`
                    });
                    showAlert({ 
                        message: `⚠️ ATENCIÓN: El usuario ${freshNombres} ${freshApellidos} (CC ${cedulaTrim}) está registrado en NÓMINA. Para modificar su perfil debes estar en el submódulo de Nómina.`, 
                        status: 'warning' 
                    });
                } else {
                    setAdvertenciaTipoContrato(null);
                }

                try {
                    const soportesData = await http.get(`/soportes/hoja-vida/${hv.id}`);
                    const dataFormated = Array.isArray(soportesData) ? soportesData : (soportesData.data || []);
                    setResultadosIA(dataFormated);
                    
                    const categoriasConDocs = {};
                    dataFormated.forEach(doc => {
                        if (doc.tipoDocumento !== 'Carnet vacunación') categoriasConDocs[doc.tipoDocumento] = true;
                    });
                    setExpandedCategories(categoriasConDocs);
                } catch (err) { setResultadosIA([]); }
            }
        } catch (error) {
            setHojaVidaId(null);
            setCvNombre('');
            setResultadosIA([]);
            setCursosAsignados([]);
            setExpandedCategories({});
            setActiveTab('datos'); 
            
            if (!isStandardUser) {
                try {
                    const token = localStorage.getItem('token');
                    const rawUsers = await axios.get(`${API_BASE_URL}/api/v1/usuarios`, { headers: { Authorization: `Bearer ${token}` } });
                    const allUsers = rawUsers.data?.content || rawUsers.data?.data || rawUsers.data || [];
                    const foundUser = Array.isArray(allUsers) ? allUsers.find(u => 
                        String(u?.persona?.numeroDocumento) === String(cedulaTrim) || 
                        String(u?.numeroDocumento) === String(cedulaTrim) || 
                        String(u?.username) === String(cedulaTrim)
                    ) : null;
                    
                    if (foundUser) {
                        const p = foundUser.persona || {};
                        const finalNombres = foundUser.nombres || `${p.primerNombre || ''} ${p.segundoNombre || ''}`.trim() || 'Usuario';
                        const finalApellidos = foundUser.apellidos || `${p.primerApellido || ''} ${p.segundoApellido || ''}`.trim() || 'Nuevo';
                        const rawEmail = p.correoElectronico || foundUser.email || foundUser.username || '';
                        const finalCorreo = (rawEmail && rawEmail.includes('@')) ? rawEmail.trim() : null;
                        const userTipoContrato = foundUser.tipoContrato || foundUser.hojaVida?.tipoContrato || p.tipoContrato || null;
                        const fallbackIngreso = new Date().toISOString().split('T')[0];
                        const prePerfil = p.perfilVacunacion || '';

                        const payload = {
                            nombres: finalNombres, apellidos: finalApellidos, cedula: cedulaTrim, fechaNacimiento: null, 
                            direccionResidencia: p.direccionResidencia || null, telefono: p.numeroTelefono || null, contactoEmergencia: null, 
                            telefonoContactoEmergencia: null, arl: null, eps: null, afp: null, cajaCompensacion: null, 
                            salario: null, subsidioTransporte: null, fechaIngreso: fallbackIngreso, estado: foundUser.estado || 'Activo', 
                            tipoContrato: userTipoContrato, fechaRetiro: null, motivoRetiro: null, correoElectronico: finalCorreo, 
                            perfilVacunacion: prePerfil || null, detalleVacunas: '[]', usuarioId: foundUser.id ? parseInt(foundUser.id) : null, 
                            cargosIds: foundUser.cargo ? [parseInt(foundUser.cargo.id)] : [], sedesIds: []
                        };

                        const responseData = await http.post('/hojas-vida', payload);
                        setHojaVidaId(responseData.data?.id || responseData.id);
                        setCvNombre(`${finalNombres} ${finalApellidos}`);
                        setUsuarioHabilitado(true);

                        setDatosCV({
                            cedula: cedulaTrim, nombres: finalNombres, apellidos: finalApellidos, fechaNacimiento: '', 
                            direccionResidencia: p.direccionResidencia || '', telefono: p.numeroTelefono || '', correoElectronico: finalCorreo || '', 
                            contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                            fechaIngreso: fallbackIngreso, tipoContrato: '', sedeId: '', cargoId: foundUser.cargo?.id || '', salario: '', subsidioTransporte: '',
                            estado: '', fechaRetiro: '', motivoRetiro: '', usuarioId: foundUser.id || '', perfilVacunacion: prePerfil, detalleVacunas: []
                        });
                    } else {
                        setUsuarioHabilitado(false);
                        showAlert({ message: 'No existe usuario con esa cédula en Gestión de Usuarios.', status: 'error' });
                    }
                } catch (err) {
                    setUsuarioHabilitado(false);
                    showAlert({ message: 'Error interno consultando usuarios.', status: 'error' });
                }
            } else {
                setUsuarioHabilitado(true);
                const p = user?.persona || {};
                setDatosCV({
                    cedula: cedulaTrim, nombres: `${p.primerNombre || ''} ${p.segundoNombre || ''}`.trim(), apellidos: `${p.primerApellido || ''} ${p.segundoApellido || ''}`.trim(), 
                    fechaNacimiento: '', direccionResidencia: '', telefono: '', correoElectronico: p.correoElectronico || user?.email || '', 
                    contactoEmergencia: '', telefonoContactoEmergencia: '', arl: '', eps: '', afp: '', cajaCompensacion: '',
                    fechaIngreso: '', tipoContrato: '', sedeId: '', cargoId: user?.cargo?.id || '', salario: '', subsidioTransporte: '', estado: '', fechaRetiro: '', motivoRetiro: '', 
                    usuarioId: user?.id || '', perfilVacunacion: p.perfilVacunacion || '', detalleVacunas: []
                });
            }
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true);
        await fetchHojaVida(searchTerm);
        setIsSearching(false);
    };

    const handleCrearCV = async (e) => {
        if(e) e.preventDefault();
        if (advertenciaTipoContrato) {
            showAlert({ 
                message: `⚠️ Operación bloqueada: El usuario pertenece a ${advertenciaTipoContrato.tipoEncontrado}. Haz clic en el botón superior 'Ir a ${advertenciaTipoContrato.tipoEncontrado.includes('OPS') ? 'Proveedores (OPS)' : 'Nómina'}' para editar su perfil en el submódulo correspondiente.`, 
                status: 'error' 
            });
            return;
        }
        try {
            const payload = {
                nombres: datosCV.nombres || null, apellidos: datosCV.apellidos || null, cedula: datosCV.cedula,
                fechaNacimiento: datosCV.fechaNacimiento || null, direccionResidencia: datosCV.direccionResidencia || null,
                telefono: datosCV.telefono || null, contactoEmergencia: datosCV.contactoEmergencia || null, telefonoContactoEmergencia: datosCV.telefonoContactoEmergencia || null,
                arl: datosCV.arl || null, eps: datosCV.eps || null, afp: datosCV.afp || null, cajaCompensacion: datosCV.cajaCompensacion || null,
                salario: datosCV.salario ? parseFloat(datosCV.salario) : null, subsidioTransporte: datosCV.subsidioTransporte || null,
                fechaIngreso: datosCV.fechaIngreso || null, estado: datosCV.estado || null, tipoContrato: datosCV.tipoContrato || null,
                fechaRetiro: datosCV.fechaRetiro || null, motivoRetiro: datosCV.motivoRetiro || null, correoElectronico: datosCV.correoElectronico || null,
                perfilVacunacion: datosCV.perfilVacunacion || null, detalleVacunas: JSON.stringify(datosCV.detalleVacunas),
                usuarioId: datosCV.usuarioId ? parseInt(datosCV.usuarioId) : null, cargosIds: datosCV.cargoId ? [parseInt(datosCV.cargoId)] : [], sedesIds: datosCV.sedeId ? [parseInt(datosCV.sedeId)] : []
            };

            if (hojaVidaId) {
                await http.put(`/hojas-vida/${hojaVidaId}`, payload);
                showAlert({ message: 'Datos guardados exitosamente', status: 'success' });
            } else {
                const responseData = await http.post('/hojas-vida', payload);
                setHojaVidaId(responseData.data?.id || responseData.id);
                showAlert({ message: 'Hoja de Vida registrada exitosamente', status: 'success' });
            }
            setCvNombre(`${datosCV.nombres} ${datosCV.apellidos}`);
        } catch (error) {
            showAlert({ message: 'Error al guardar la información', status: 'error' });
        }
    };

    const handleCrearCarpeta = async (e) => {
        e.preventDefault();
        if (!nuevaCarpetaNombre.trim()) return;
        try {
            await http.post('/categorias-soportes', { nombre: nuevaCarpetaNombre.trim() });
            showAlert({ message: 'Carpeta creada globalmente para todos los usuarios', status: 'success' });
            setNuevaCarpetaNombre('');
            cargarCategoriasSoportes();
        } catch (error) {
            showAlert({ message: 'Error al crear la carpeta. Inténtalo de nuevo.', status: 'error' });
        }
    };

    const handleEliminarCarpeta = async (nombreCarpeta) => {
        if (!window.confirm(`¿Eliminar la carpeta "${nombreCarpeta}" de forma permanente para todos los usuarios?`)) return;
        try {
            await http.delete(`/categorias-soportes/${encodeURIComponent(nombreCarpeta)}`);
            showAlert({ message: 'Carpeta eliminada globalmente', status: 'success' });
            cargarCategoriasSoportes();
        } catch (error) {
            showAlert({ message: 'Error al eliminar la carpeta. Inténtalo de nuevo.', status: 'error' });
        }
    };

    const toggleCategory = useCallback((categoria) => {
        setExpandedCategories(prev => ({ ...prev, [categoria]: !prev[categoria] }));
    }, []);

    const handleDragOver = useCallback((e, categoria) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggingCategory !== categoria) setDraggingCategory(categoria);
    }, [draggingCategory]);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingCategory(null);
    }, []);

    const handleManualUpload = async (e, categoria) => {
        const file = e.target.files[0];
        if (!file || !hojaVidaId) return;
        const formData = new FormData();
        formData.append('archivo', file);
        formData.append('datos', new Blob([JSON.stringify({ tipoDocumento: categoria, hojaVidaId: hojaVidaId })], { type: 'application/json' }));
        try {
            const data = await http.post('/soportes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setResultadosIA(prev => [...prev, data.data || data]);
            showAlert({ message: 'Documento subido exitosamente', status: 'success' });
            setExpandedCategories(prev => ({ ...prev, [categoria]: true }));
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al subir el documento';
            showAlert({ message: msg, status: 'error' });
        }
    };

    const handleDragStartDoc = (e, doc, fromCategory) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: 'MOVE_SUPPORT',
            docId: doc.id,
            fromCategory: fromCategory
        }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleMoverSoporte = useCallback(async (docId, targetCategory) => {
        try {
            // Actualización optimista instantánea en UI
            setResultadosIA(prev => prev.map(doc => {
                if (doc.id === docId) {
                    return { ...doc, tipoDocumento: targetCategory };
                }
                return doc;
            }));

            await http.put(`/soportes/${docId}/categoria`, { tipoDocumento: targetCategory });
            showAlert({ message: `Documento movido a "${targetCategory}"`, status: 'success' });
            setExpandedCategories(prev => ({ ...prev, [targetCategory]: true }));
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al mover el documento de carpeta';
            showAlert({ message: msg, status: 'error' });
            if (hojaVidaId) {
                try {
                    const soportesData = await http.get(`/soportes/hoja-vida/${hojaVidaId}`);
                    setResultadosIA(Array.isArray(soportesData) ? soportesData : (soportesData.data || []));
                } catch (err) {}
            }
        }
    }, [hojaVidaId, showAlert]);

    const handleDrop = useCallback(async (e, categoria) => {
        e.preventDefault();
        e.stopPropagation();
        setDraggingCategory(null);

        // 1. Verificar si es una reubicación interna de tarjeta (mover entre carpetas)
        const dragDataStr = e.dataTransfer.getData('text/plain');
        if (dragDataStr) {
            try {
                const dragData = JSON.parse(dragDataStr);
                if (dragData && dragData.type === 'MOVE_SUPPORT' && dragData.docId) {
                    if (dragData.fromCategory !== categoria) {
                        await handleMoverSoporte(dragData.docId, categoria);
                    }
                    return;
                }
            } catch (parseErr) {}
        }

        // 2. Si no es reubicación, verificar si es subida de archivo PDF externo desde el sistema
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            await handleManualUpload({ target: { files: [file] } }, categoria);
        } else if (file) {
            showAlert({ message: 'Solo se permiten archivos PDF', status: 'error' });
        }
    }, [hojaVidaId, showAlert, handleManualUpload, handleMoverSoporte]);

    const handleEliminarDocumento = async (idSoporte) => {
        if (!window.confirm('¿Eliminar este documento de forma permanente?')) return;
        try {
            await http.delete(`/soportes/${idSoporte}`);
            setResultadosIA(prev => prev.filter(doc => doc.id !== idSoporte));
            showAlert({ message: 'Documento eliminado correctamente', status: 'success' });
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al eliminar el documento';
            showAlert({ message: msg, status: 'error' });
        }
    };

    const handleGuardarNombre = async (idSoporte) => {
        if (!editDocValue.trim()) return;
        try {
            await http.put(`/soportes/${idSoporte}/nombre?nombreArchivo=${encodeURIComponent(editDocValue.trim())}`);
            setResultadosIA(prev => prev.map(doc => doc.id === idSoporte ? { ...doc, nombreArchivo: editDocValue.trim() } : doc));
            setEditingDocId(null);
            showAlert({ message: 'Nombre del archivo actualizado correctamente', status: 'success' });
        } catch (error) {
            const msg = error?.response?.data?.message || 'Error al actualizar el nombre del archivo';
            showAlert({ message: msg, status: 'error' });
        }
    };

    const handleRechazarDocumento = async (e) => {
        e.preventDefault();
        if (!docToReject) return;
        try {
            await http.put(`/soportes/${docToReject.id}/rechazar`, rejectData);
            setResultadosIA(prev => prev.map(doc => doc.id === docToReject.id ? { ...doc, estado: 'Rechazado' } : doc));
            setRejectModalOpen(false);
            setDocToReject(null);
            setRejectData({ motivo: '', fechaLimite: '' });
            showAlert({ message: 'Documento rechazado y notificado', status: 'success' });
        } catch (error) {}
    };

    const handleSubirFoto = async (e) => {
        const archivo = e.target.files[0];
        if (!archivo) return;
        if (!archivo.type.startsWith('image/')) {
            alert('Por favor selecciona un archivo de imagen válido.');
            return;
        }
        // Preview local inmediato mientras sube
        const previewUrl = URL.createObjectURL(archivo);
        setDatosCV(prev => ({ ...prev, fotoUrl: previewUrl, _fotoEsPreview: true }));
        try {
            const formData = new FormData();
            formData.append('foto', archivo);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/hojas-vida/${hojaVidaId}/foto`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Error ${response.status}: ${errText}`);
            }
            const data = await response.json();
            // El backend devuelve HojaVidaResponseDTO directamente (sin wrapper .data)
            const nuevaFotoUrl = data?.fotoUrl || data?.data?.fotoUrl || '';
            // Añadir timestamp para evitar caché del browser
            const urlConCache = nuevaFotoUrl ? `${API_BASE_URL}${nuevaFotoUrl}?t=${Date.now()}` : previewUrl;
            URL.revokeObjectURL(previewUrl);
            setDatosCV(prev => ({ ...prev, fotoUrl: urlConCache, _fotoEsPreview: false }));
            showAlert({ message: 'Foto actualizada correctamente', status: 'success' });
        } catch (err) {
            URL.revokeObjectURL(previewUrl);
            setDatosCV(prev => ({ ...prev, fotoUrl: '', _fotoEsPreview: false }));
            showAlert({ message: 'Error al subir la foto: ' + err.message, status: 'error' });
        }
        // Limpiar input para permitir subir la misma imagen de nuevo
        e.target.value = '';
    };

    const verDocumento = async (soporteId, nombreArchivo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/soportes/descargar/${soporteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo obtener el archivo');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (e) {
            alert('Error al abrir el documento: ' + e.message);
        }
    };

    const handleDescargarDocumento = async (soporteId, nombreArchivo) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/v1/soportes/descargar/${soporteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo descargar el archivo');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo || 'documento.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (e) {
            alert('Error al descargar el documento: ' + e.message);
        }
    };

    const handleCrearCursoCatalogo = async (e) => {
        e.preventDefault();
        try {
            await cursosService.crearCursoCatalogo(nuevoCursoMaestro);
            showAlert({ message: "Curso añadido al catálogo", status: "success" });
            setNuevoCursoMaestro({ nombre: '', descripcion: '', fechaLimiteGlobal: '', esGlobal: true, mesesVigencia: 12 });
            cargarCatalogoCursos();
        } catch (error) {}
    };

    const handleAsignarCurso = async (e) => {
        e.preventDefault();
        try {
            await cursosService.asignarCurso({ 
                usuarioId: datosCV.usuarioId, 
                cursoMaestroId: datosAsignacion.cursoMaestroId 
            });
            showAlert({ message: "Curso asignado", status: "success" });
            setShowAssignModal(false);
            cargarCursosAsignados();
        } catch (error) {}
    };

    const handleEliminarAsignacion = async (id) => {
        if (!window.confirm('¿Eliminar esta asignación?')) return;
        try {
            await cursosService.eliminarAsignacion(id);
            showAlert({ message: "Asignación eliminada", status: "success" });
            cargarCursosAsignados();
        } catch (error) {}
    };

    const handleSubirCertificadoCurso = async (cursoAsignadoId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            await cursosService.subirCertificado(cursoAsignadoId, file);
            showAlert({ message: 'Certificado cargado correctamente', status: 'success' });
            cargarCursosAsignados();
        } catch (error) {
            const msg = error.response?.data || 'Error al subir el certificado';
            showAlert({ message: typeof msg === 'string' ? msg : 'Error al subir el certificado', status: 'error' });
        }
    };

    const handleToggleVacuna = (vacunaBackend) => {
        setDatosCV(prev => {
            const currentDetalle = prev.detalleVacunas || [];
            const existe = currentDetalle.find(v => v.nombre === vacunaBackend.nombre);
            if (existe) {
                return { ...prev, detalleVacunas: currentDetalle.filter(v => v.nombre !== vacunaBackend.nombre) };
            } else {
                return { ...prev, detalleVacunas: [...currentDetalle, { 
                    nombre: vacunaBackend.nombre, 
                    dosisRequeridas: vacunaBackend.dosisRequeridas,
                    requiereRefuerzo: vacunaBackend.requiereRefuerzo,
                    fechas: Array(vacunaBackend.dosisRequeridas).fill(""),
                    fechaRefuerzo: ""
                }] };
            }
        });
    };

    const handleFechaDosis = (vacunaIndex, dosisIndex, fecha) => {
        setDatosCV(prev => {
            const nuevas = [...prev.detalleVacunas];
            nuevas[vacunaIndex].fechas[dosisIndex] = fecha;
            return { ...prev, detalleVacunas: nuevas };
        });
    };

    const handleFechaRefuerzo = (vacunaIndex, fecha) => {
         setDatosCV(prev => {
            const nuevas = [...prev.detalleVacunas];
            nuevas[vacunaIndex].fechaRefuerzo = fecha;
            return { ...prev, detalleVacunas: nuevas };
        });
    };

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white";
    const labelClass = "text-xs font-semibold text-gray-600 mb-1.5 block";
    const readOnlyClass = "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-medium";

    const carnetDocumento = useMemo(() => resultadosIA.find(d => d.tipoDocumento === 'Carnet vacunación'), [resultadosIA]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* AVISO DESTACADO DE ADVERTENCIA DE CONTRATO (COLOCADO ARRIBA) */}
                {advertenciaTipoContrato && (
                    <div className={`p-5 md:p-6 rounded-2xl shadow-xl transition-all duration-300 border flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden ${
                        advertenciaTipoContrato.tipoEncontrado.includes('OPS') 
                            ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white border-amber-400/50 shadow-amber-600/30' 
                            : 'bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-800 text-white border-teal-400/50 shadow-teal-600/30'
                    }`}>
                        <div className="flex items-start md:items-center gap-4 relative z-10">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0 shadow-inner">
                                <AlertTriangle className="w-8 h-8 text-amber-200 animate-bounce" />
                            </div>
                            <div className="space-y-1">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider mb-1">
                                    ¡Atención — Clasificación Diferente!
                                </span>
                                <h3 className="text-lg md:text-xl font-black tracking-tight leading-snug">
                                    El usuario pertenece a {advertenciaTipoContrato.tipoEncontrado}
                                </h3>
                                <p className="text-sm md:text-base font-medium text-white/90">
                                    <strong className="text-amber-100 underline decoration-2">{advertenciaTipoContrato.nombre}</strong> (Cédula: <strong>{advertenciaTipoContrato.cedula}</strong>) no está en {advertenciaTipoContrato.tipoEsperado}.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate(`${advertenciaTipoContrato.targetRoute}?cedula=${advertenciaTipoContrato.cedula}`)}
                            className="px-6 py-3 bg-white text-slate-900 font-extrabold text-sm rounded-xl shadow-lg hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-stretch md:self-auto justify-center cursor-pointer"
                        >
                            <span>Ir a {advertenciaTipoContrato.tipoEncontrado.includes('OPS') ? 'Proveedores (OPS)' : 'Nómina'}</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white text-gray-500 hover:bg-gray-100 rounded-full shadow-sm transition-all self-start"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                {tipoSubmodulo === 'NOMINA' ? 'Hojas de Vida — NÓMINA' : tipoSubmodulo === 'PROVEEDORES' ? 'Hojas de Vida — PROVEEDORES (OPS)' : (isStandardUser ? 'Mi Hoja de Vida' : 'Gestión de Hoja de Vida')}
                            </h1>
                            {tipoSubmodulo === 'NOMINA' && (
                                <span className="px-3 py-0.5 bg-teal-100 text-teal-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5 text-teal-600" /> Submódulo Nómina
                                </span>
                            )}
                            {tipoSubmodulo === 'PROVEEDORES' && (
                                <span className="px-3 py-0.5 bg-indigo-100 text-indigo-800 font-extrabold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Submódulo Proveedores (OPS)
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-xs md:text-sm">{hojaVidaId ? `Perfil activo: ${cvNombre}` : (isStandardUser ? 'Verifica y completa tus datos' : 'Ingrese la cédula para consultar o gestionar un perfil laboral')}</p>
                    </div>
                </div>

                {!isStandardUser && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Search className="h-4 w-4" /></div>
                                <input type="text" required className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-sm outline-none" placeholder={`Buscar cédula de ${tipoSubmodulo === 'NOMINA' ? 'personal de Nómina' : tipoSubmodulo === 'PROVEEDORES' ? 'contratista/OPS' : 'usuario'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <button type="submit" disabled={isSearching} className={`px-6 py-2 ${tipoSubmodulo === 'NOMINA' ? 'bg-teal-600 hover:bg-teal-700' : tipoSubmodulo === 'PROVEEDORES' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold rounded transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[100px] text-sm`}>
                                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                            </button>
                        </form>
                    </div>
                )}

                {!usuarioHabilitado && !isStandardUser ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 md:p-12 flex flex-col items-center justify-center text-center">
                        <User size={48} className="text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-700">Ningún usuario seleccionado</h2>
                        <p className="text-gray-500 text-sm mt-2 max-w-md">
                            Utilice el buscador superior para cargar los datos de un colaborador. <br/><br/>
                            <span className="text-red-500 font-semibold">Nota:</span> Si el usuario no existe, debe registrarlo primero en el módulo de <b>Gestión de Usuarios</b>.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                            <button onClick={() => setActiveTab('datos')} className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'datos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <User className="w-4 h-4" /> Datos Generales
                            </button>
                            <button onClick={() => setActiveTab('soportes')} className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'soportes' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Folder className="w-4 h-4" /> Soportes Documentales
                            </button>
                            <button onClick={() => setActiveTab('vacunacion')} className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'vacunacion' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Syringe className="w-4 h-4" /> Vacunación
                            </button>
                            <button onClick={() => setActiveTab('cursos')} className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'cursos' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                <Award className="w-4 h-4" /> Formación y Cursos
                            </button>
                            {hojaVidaId && (
                                <button onClick={() => setActiveTab('trazabilidad')} className={`flex items-center gap-2 px-4 md:px-6 py-3 text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'trazabilidad' ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <History className="w-4 h-4" /> Trazabilidad
                                </button>
                            )}
                        </div>

                        <div className="p-4 md:p-6">
                            {activeTab === 'datos' && (
                                <form onSubmit={handleCrearCV} className="space-y-6">
                                    {/* --- FOTO DE PERFIL --- */}
                                    <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                                        <div className="relative shrink-0">
                                            <div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm">
                                                {datosCV.fotoUrl ? (
                                                    <SecureImage
                                                        src={datosCV.fotoUrl?.startsWith('blob:') || datosCV.fotoUrl?.startsWith('http') ? datosCV.fotoUrl : `${API_BASE_URL}${datosCV.fotoUrl}`}
                                                        alt="Foto de perfil"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-10 h-10 text-gray-300" />
                                                )}
                                            </div>
                                            <label htmlFor="foto-upload" className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition-colors" title="Cambiar foto">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                            </label>
                                            <input id="foto-upload" type="file" accept="image/*" className="hidden" onChange={handleSubirFoto} disabled={!hojaVidaId} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{datosCV.nombres} {datosCV.apellidos}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">CC {datosCV.cedula}</p>
                                            <p className="text-xs text-gray-400 mt-2">{datosCV.fotoUrl ? 'Haz clic en el ícono de cámara para cambiar la foto' : 'Sin foto — haz clic en el ícono de cámara para subir una'}</p>
                                        </div>
                                    </div>
                                    <div className={`grid grid-cols-1 ${isAdminOrHR ? 'lg:grid-cols-2' : ''} gap-y-6 lg:gap-x-12`}>
                                        <div className="space-y-4">
                                            <div><label className={labelClass}>Cédula de ciudadanía</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.cedula} /></div>
                                            <div><label className={labelClass}>Nombres</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.nombres} /></div>
                                            <div><label className={labelClass}>Apellidos</label><input required readOnly type="text" className={`${inputClass} ${readOnlyClass}`} value={datosCV.apellidos} /></div>
                                            <div><label className={labelClass}>Correo electrónico</label><input readOnly type="email" className={`${inputClass} ${readOnlyClass}`} value={datosCV.correoElectronico} /></div>
                                            <div className="border-t border-gray-100 my-4 pt-4">
                                                <h4 className="text-xs font-bold text-blue-600 mb-4 uppercase">Información Complementaria</h4>
                                                <div><label className={labelClass}>Fecha Nacimiento</label><input type="date" className={inputClass} value={datosCV.fechaNacimiento} onChange={(e) => setDatosCV({...datosCV, fechaNacimiento: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Dirección</label><input type="text" className={inputClass} value={datosCV.direccionResidencia} onChange={(e) => setDatosCV({...datosCV, direccionResidencia: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Teléfono(s)</label><input type="text" className={inputClass} value={datosCV.telefono} onChange={(e) => setDatosCV({...datosCV, telefono: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Contacto de emergencia</label><input type="text" className={inputClass} value={datosCV.contactoEmergencia} onChange={(e) => setDatosCV({...datosCV, contactoEmergencia: e.target.value})} /></div>
                                                <div className="mt-4"><label className={labelClass}>Tel. Contacto Emergencia</label><input type="text" className={inputClass} value={datosCV.telefonoContactoEmergencia} onChange={(e) => setDatosCV({...datosCV, telefonoContactoEmergencia: e.target.value})} /></div>
                                            </div>
                                        </div>

                                        {isAdminOrHR && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-xs font-bold text-blue-600 uppercase">Información Laboral y Salud</h4>
                                                    <span className="text-[10px] text-gray-400 italic bg-gray-50 px-2 py-0.5 rounded border border-gray-200">Editar en Gestión de Usuarios</span>
                                                </div>
                                                <div><label className={labelClass}>Perfil de Vacunación</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.perfilVacunacion || 'No definido'} title="Se configura desde Gestión de Usuarios" /></div>
                                                <div className="mt-4"><label className={labelClass}>ARL</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={resolveOptionLabel(datosCV.arl, 'arl', true)} /></div>
                                                <div><label className={labelClass}>EPS</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={resolveOptionLabel(datosCV.eps, 'eps', true)} /></div>
                                                <div><label className={labelClass}>AFP</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={resolveOptionLabel(datosCV.afp, 'afp', true)} /></div>
                                                <div><label className={labelClass}>Caja de compensación</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={resolveOptionLabel(datosCV.cajaCompensacion, 'caja', true)} /></div>
                                                <div><label className={labelClass}>Fecha de ingreso</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.fechaIngreso || '—'} /></div>
                                                <div><label className={labelClass}>Tipo de contrato</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.tipoContrato || '—'} /></div>
                                                <div><label className={labelClass}>Sede</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={catalogoSedes.find(s => String(s.id) === String(datosCV.sedeId))?.nombre || (datosCV.sedeId && isNaN(datosCV.sedeId) ? datosCV.sedeId : '—')} /></div>
                                                <div><label className={labelClass}>Cargo / Objeto</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={catalogoCargos.find(c => String(c.id) === String(datosCV.cargoId))?.nombre || datosCV.cargoId || '—'} title="Se asigna únicamente al crear o editar el usuario en Gestión de Usuarios" /></div>
                                                <div><label className={labelClass}>Estado</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.estado || '—'} /></div>
                                                <div><label className={labelClass}>Fecha de retiro</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.fechaRetiro || '—'} /></div>
                                                <div><label className={labelClass}>Motivo de retiro</label><input type="text" readOnly className={`${inputClass} ${readOnlyClass}`} value={datosCV.motivoRetiro || '—'} /></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-6 border-t border-gray-200">
                                        <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 text-white font-bold rounded shadow-sm hover:bg-blue-700 transition-colors">Guardar Hoja de Vida</button>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'soportes' && (
                                <div className="space-y-3">
                                    {isAdminOrHR && (
                                        <div className="flex justify-end mb-4">
                                            <button type="button" onClick={() => setShowGestionCarpetasModal(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-gray-800 text-white text-xs font-bold rounded shadow-sm hover:bg-gray-900 transition-colors">
                                                <Settings className="w-4 h-4" /> Gestionar Carpetas
                                            </button>
                                        </div>
                                    )}

                                    {categoriasSoportes.map((categoria) => {
                                        const docsCategoria = resultadosIA
                                        .filter(d => d.tipoDocumento === categoria || (categoria === "Otros Soportes" && !categoriasSoportes.includes(d.tipoDocumento)))
                                        .sort((a, b) => (a.nombreArchivo || '').localeCompare(b.nombreArchivo || ''));
                                        const isExpanded = expandedCategories[categoria];
                                        const isDragging = draggingCategory === categoria;

                                        return (
                                            <div key={categoria} className={`border rounded-lg bg-white overflow-hidden transition-all duration-200 relative ${isDragging ? 'border-blue-500 ring-2 ring-blue-200 scale-[1.01]' : 'border-gray-200 shadow-sm hover:border-blue-300'}`} onDragOver={(e) => handleDragOver(e, categoria)} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, categoria)}>
                                                <div className={`px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors ${isExpanded ? 'bg-blue-50/50 border-b border-blue-100' : 'bg-white hover:bg-gray-50'}`} onClick={() => toggleCategory(categoria)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-gray-400">{isExpanded ? <ChevronDown className="w-5 h-5 text-blue-500" /> : <ChevronRight className="w-5 h-5" />}</div>
                                                        <Folder className={`w-5 h-5 shrink-0 ${isExpanded ? 'text-blue-500 fill-blue-100' : 'text-gray-400 fill-gray-100'}`} />
                                                        <h3 className={`font-bold text-xs md:text-sm truncate ${isExpanded ? 'text-blue-800' : 'text-gray-700'}`}>{categoria}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {docsCategoria.length > 0 && <span className={`text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap ${isExpanded ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{docsCategoria.length} doc{docsCategoria.length !== 1 ? 's' : ''}</span>}
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className={`p-4 transition-colors ${isDragging ? 'bg-blue-50/30' : 'bg-white'}`}>
                                                        {isDragging && <div className="absolute inset-0 bg-blue-50/90 border-2 border-dashed border-blue-400 z-10 flex flex-col items-center justify-center pointer-events-none"><Upload className="w-10 h-10 text-blue-500 animate-bounce mb-2" /><span className="text-blue-700 font-bold text-lg">Suelta el PDF aquí</span></div>}
                                                        {docsCategoria.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                                                <Upload className="w-8 h-8 mb-2 text-gray-300" /><p className="text-sm font-semibold text-gray-600 mb-1">Carpeta vacía</p><p className="text-xs mb-4 text-gray-400">Arrastra y suelta tu archivo PDF aquí o</p>
                                                                <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded shadow-sm text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors">Explorar archivos<input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} /></label>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                                {docsCategoria.map(doc => (
                                                                    <div 
                                                                        key={doc.id} 
                                                                        draggable={true}
                                                                        onDragStart={(e) => handleDragStartDoc(e, doc, categoria)}
                                                                        className={`bg-white border p-3 rounded-lg shadow-sm flex flex-col gap-2 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group ${doc.estado === 'Rechazado' ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`}
                                                                    >
                                                                        {editingDocId === doc.id ? (
                                                                            <div className="flex gap-1">
                                                                                <input type="text" autoFocus value={editDocValue} onChange={(e) => setEditDocValue(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-blue-300 rounded outline-none" />
                                                                                <button onClick={() => handleGuardarNombre(doc.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"><Save className="w-3.5 h-3.5"/></button>
                                                                                <button onClick={() => setEditingDocId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X className="w-3.5 h-3.5"/></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex justify-between items-start">
                                                                                <div className="flex flex-col gap-1 overflow-hidden pr-2">
                                                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                                                        <GripVertical className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 shrink-0 cursor-grab opacity-60 group-hover:opacity-100 transition-opacity" title="Arrastrar para mover de carpeta" />
                                                                                        <FileText className="w-4 h-4 text-red-500 shrink-0" />
                                                                                        <h4 className="font-semibold text-gray-700 text-xs truncate" title={doc.nombreArchivo}>{doc.nombreArchivo}</h4>
                                                                                    </div>
                                                                                    {doc.estado === 'Rechazado' && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded inline-block w-max tracking-wide ml-5">RECHAZADO</span>}
                                                                                </div>
                                                                                <button onClick={() => { setEditingDocId(doc.id); setEditDocValue(doc.nombreArchivo || ''); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded shrink-0 transition-colors" title="Cambiar nombre del archivo"><Edit2 className="w-3.5 h-3.5"/></button>
                                                                            </div>
                                                                        )}
                                                                        <div className="mt-auto pt-2 grid grid-cols-4 gap-1.5">
                                                                            <button type="button" onClick={() => verDocumento(doc.id, doc.nombreArchivo)} className="py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 flex justify-center"><Eye className="w-3.5 h-3.5" /></button>
                                                                            <button type="button" onClick={() => handleDescargarDocumento(doc.id, doc.nombreArchivo)} className="py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex justify-center"><DownloadCloud className="w-3.5 h-3.5" /></button>
                                                                            {isAdminOrHR ? <button type="button" onClick={() => { setDocToReject(doc); setRejectModalOpen(true); }} className="py-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex justify-center"><AlertCircle className="w-3.5 h-3.5" /></button> : <div className="py-1.5 bg-transparent"></div>}
                                                                            <button type="button" onClick={() => handleEliminarDocumento(doc.id)} className="py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 flex justify-center"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                <label className="border-2 border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-colors cursor-pointer min-h-[110px] group">
                                                                    <div className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:text-blue-600 text-gray-400"><Plus className="w-4 h-4" /></div>
                                                                    <p className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">Añadir otro soporte</p><p className="text-[10px] text-gray-400 mt-0.5">Click o arrastrar PDF</p><input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, categoria)} />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'vacunacion' && (
                                <div className="space-y-6">
                                    {!datosCV.perfilVacunacion ? (
                                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"><Syringe size={48} className="mx-auto mb-4 opacity-20" /><p className="font-semibold text-gray-500">Perfil de Vacunación no definido</p><p className="text-sm mt-1">Este usuario no tiene un perfil configurado en Gestión de Usuarios.</p></div>
                                    ) : (
                                        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                                            <div className="w-full lg:w-1/3 space-y-4">
                                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                                                    <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2 mb-2"><Syringe size={18}/> Carnet de Vacunación</h3>
                                                    <p className="text-xs text-blue-700 mb-5">Suba el archivo PDF escaneado con todas sus vacunas registradas.</p>
                                                    {carnetDocumento ? (
                                                        <div className="bg-white border border-blue-200 p-4 rounded shadow-sm flex flex-col gap-3">
                                                            <div className="flex items-center gap-2 overflow-hidden"><FileText className="w-5 h-5 text-red-500 shrink-0" /><h4 className="font-semibold text-gray-800 text-xs truncate">{carnetDocumento.tipoDocumento}</h4></div>
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <button type="button" onClick={() => verDocumento(carnetDocumento.id, carnetDocumento.nombreArchivo)} className="py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex justify-center"><Eye size={14}/></button>
                                                                <button type="button" onClick={() => handleEliminarDocumento(carnetDocumento.id)} className="py-2 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex justify-center"><Trash2 size={14}/></button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-dashed border-blue-300 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-50 transition-colors">
                                                            <Upload size={18} /> Seleccionar PDF <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleManualUpload(e, 'Carnet vacunación')} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-full lg:w-2/3 space-y-4">
                                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="bg-gray-50 border-b border-gray-200 px-4 md:px-5 py-4 flex justify-between items-center"><h3 className="font-bold text-gray-800 text-sm">Registro de Dosis - {datosCV.perfilVacunacion}</h3></div>
                                                    <div className="p-4 md:p-5 space-y-4">
                                                        {vacunasPerfil.length === 0 ? (
                                                            <div className="text-center py-6 text-gray-400 text-sm">No hay vacunas configuradas para el perfil {datosCV.perfilVacunacion}.</div>
                                                        ) : (
                                                            vacunasPerfil.map((vacuna, vIndex) => {
                                                                const vacunaData = (datosCV.detalleVacunas || []).find(v => v.nombre === vacuna.nombre);
                                                                const isChecked = !!vacunaData;
                                                                return (
                                                                    <div key={vIndex} className={`p-3 md:p-4 rounded-lg border transition-colors ${isChecked ? 'border-blue-200 bg-blue-50/40' : 'border-gray-100 bg-gray-50/50'} relative`}>
                                                                        <label className="flex items-center gap-3 cursor-pointer select-none mb-3"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" checked={isChecked} onChange={() => handleToggleVacuna(vacuna)} /><h4 className={`font-bold text-sm md:text-base ${isChecked ? 'text-blue-900' : 'text-gray-600'}`}>{vacuna.nombre} <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1 md:ml-2 whitespace-nowrap">{vacuna.dosisRequeridas} Dosis {vacuna.requiereRefuerzo && '+ Refuerzo'}</span></h4></label>
                                                                        {isChecked && (
                                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 md:pl-7">
                                                                                {(vacunaData.fechas || []).map((fecha, dIndex) => (
                                                                                    <div key={dIndex} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm"><span className="text-xs font-bold text-gray-600 w-16">Dosis {dIndex + 1}:</span><input type="date" className="flex-1 px-2 py-1 text-xs font-medium border border-gray-300 rounded w-full" value={fecha} onChange={(e) => { const vIdx = datosCV.detalleVacunas.findIndex(v => v.nombre === vacuna.nombre); if(vIdx !== -1) handleFechaDosis(vIdx, dIndex, e.target.value); }} /></div>
                                                                                ))}
                                                                                {vacuna.requiereRefuerzo && <div className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-200 shadow-sm"><span className="text-xs font-bold text-blue-800 w-16">Refuerzo:</span><input type="date" className="flex-1 px-2 py-1 text-xs font-medium border border-blue-300 rounded bg-white w-full" value={vacunaData.fechaRefuerzo || ''} onChange={(e) => { const vIdx = datosCV.detalleVacunas.findIndex(v => v.nombre === vacuna.nombre); if(vIdx !== -1) handleFechaRefuerzo(vIdx, e.target.value); }} /></div>}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    <div className="p-4 bg-white border-t border-gray-200 flex justify-end"><button type="button" onClick={handleCrearCV} className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded shadow-sm text-sm hover:bg-blue-700 transition-colors">Guardar Registro de Vacunas</button></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'cursos' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div><h3 className="text-sm font-bold text-gray-800">Requerimientos de Formación</h3><p className="text-xs text-gray-500 mt-1">{isAdminOrHR ? "Asigne cursos obligatorios al colaborador y gestione el catálogo." : "Cursos requeridos por la institución. Suba su certificado."}</p></div>
                                        {isAdminOrHR && (
                                            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0"><button type="button" onClick={() => { cargarCatalogoCursos(); setShowCatalogModal(true); }} className="flex-1 md:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded text-xs font-bold hover:bg-gray-50">Catálogo</button><button type="button" onClick={() => { cargarCatalogoCursos(); setShowAssignModal(true); }} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"><Plus size={14} /> Asignar</button></div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {cursosAsignados.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg text-gray-400"><BookOpen size={48} className="mx-auto mb-4 opacity-20" /><p className="text-sm font-semibold">No hay cursos asignados a este perfil</p></div>
                                        ) : (
                                            cursosAsignados.map((asignacion) => (
                                                <div key={asignacion.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2 md:gap-3"><h4 className="text-sm font-bold text-gray-800">{asignacion.cursoNombre}</h4><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${asignacion.estado === 'ENTREGADO' || asignacion.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{asignacion.estado}</span></div>
                                                        <p className="text-xs text-gray-600">{asignacion.descripcion}</p>
                                                        <div className="flex flex-wrap gap-2 md:gap-3 pt-2"><div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap"><Clock size={12} className="text-gray-400" /> Límite de carga: {asignacion.fechaLimite || 'Sin límite'}</div>{asignacion.fechaExpiracion && <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap"><MapPin size={12} className="text-gray-400" /> Vence: {asignacion.fechaExpiracion}</div>}</div>
                                                    </div>
                                                    <div className="w-full md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4">
                                                        {asignacion.estado === 'ENTREGADO' || asignacion.estado === 'COMPLETADO' || asignacion.certificadoUrl ? (
                                                            <div className="space-y-2 w-full">
                                                                <div className="bg-green-50 text-green-700 rounded p-3 text-center border border-green-200 w-full"><CheckCircle size={20} className="mx-auto mb-1" /><p className="text-xs font-bold">Certificado Entregado</p></div>
                                                                {asignacion.certificadoUrl && (
                                                                    <button type="button" onClick={() => window.open(`${API_BASE_URL}${asignacion.certificadoUrl}`, '_blank')} className="w-full py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded border border-blue-200 hover:bg-blue-100 flex items-center justify-center gap-1 transition-colors"><Eye size={14} /> Ver Certificado</button>
                                                                )}
                                                                {isAdminOrHR && (asignacion.esGlobal ? <span className="block text-center text-[10px] text-gray-400 font-medium py-1">Curso Global Institucional</span> : <button type="button" onClick={() => handleEliminarAsignacion(asignacion.id)} className="w-full py-2 md:py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded">Retirar Asignación</button>)}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2 w-full">
                                                                {!asignacion.permiteCarga ? (
                                                                    <div className="bg-red-50 text-red-700 rounded p-3 text-center border border-red-200 w-full"><AlertCircle size={20} className="mx-auto mb-1" /><p className="text-xs font-bold">Plazo Vencido</p></div>
                                                                ) : (
                                                                    <label className="cursor-pointer flex justify-center items-center gap-2 w-full py-2.5 md:py-2 bg-blue-50 text-blue-700 rounded font-bold text-xs border border-blue-200 hover:bg-blue-100 transition-colors"><Upload size={14} /> Subir Certificado <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleSubirCertificadoCurso(asignacion.id, e)} /></label>
                                                                )}
                                                                {isAdminOrHR && (asignacion.esGlobal ? <span className="block text-center text-[10px] text-gray-400 font-medium py-1">Curso Global Institucional</span> : <button type="button" onClick={() => handleEliminarAsignacion(asignacion.id)} className="w-full py-2 md:py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded">Retirar Asignación</button>)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'trazabilidad' && (
                                <TrazabilidadPanel
                                    logs={historialHV}
                                    loading={loadingHistorialHV}
                                    titulo={`Trazabilidad — ${cvNombre}`}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            {rejectModalOpen && docToReject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-[95%] sm:max-w-md overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between"><h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base"><AlertCircle className="w-5 h-5 text-orange-500" /> Rechazar Documento</h3><button type="button" onClick={() => setRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleRechazarDocumento} className="p-4 md:p-6 space-y-4">
                            <p className="text-xs md:text-sm text-gray-600">Estás rechazando: <span className="font-bold text-gray-800">{docToReject.tipoDocumento}</span>. Se enviará una notificación a <strong className="break-all">{datosCV.correoElectronico || 'correo no registrado'}</strong>.</p>
                            <div className="space-y-2"><label className="text-xs font-semibold text-gray-600 block">Motivo del rechazo *</label><textarea required rows={3} className={inputClass} value={rejectData.motivo} onChange={(e) => setRejectData({...rejectData, motivo: e.target.value})} /></div>
                            <div className="space-y-2"><label className="text-xs font-semibold text-gray-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha límite para subir corrección *</label><input required type="date" className={inputClass} value={rejectData.fechaLimite} onChange={(e) => setRejectData({...rejectData, fechaLimite: e.target.value})} /></div>
                            <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2"><button type="button" onClick={() => setRejectModalOpen(false)} className="w-full sm:w-auto px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 font-medium">Cancelar</button><button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-orange-500 rounded hover:bg-orange-600 font-bold">Confirmar Rechazo</button></div>
                        </form>
                    </div>
                </div>
            )}

            {isAdminOrHR && showGestionCarpetasModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-[95%] sm:max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50"><h3 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500" /> Gestionar Carpetas</h3><button type="button" onClick={() => setShowGestionCarpetasModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button></div>
                        <div className="p-4 bg-white border-b border-gray-100"><form onSubmit={handleCrearCarpeta} className="flex flex-col sm:flex-row gap-2"><input type="text" required placeholder="Nombre de la nueva carpeta" className={inputClass} value={nuevaCarpetaNombre} onChange={e => setNuevaCarpetaNombre(e.target.value)} /><button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 whitespace-nowrap">Añadir</button></form></div>
                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50"><div className="space-y-2">{categoriasSoportes.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No hay carpetas configuradas.</p>}{categoriasSoportes.map((categoria, idx) => (<div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-3 rounded shadow-sm gap-2"><span className="text-xs md:text-sm font-semibold text-gray-700 truncate">{categoria}</span><button type="button" onClick={() => handleEliminarCarpeta(categoria)} className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"><Trash2 size={16} /></button></div>))}</div></div>
                    </div>
                </div>
            )}

            {isAdminOrHR && showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-[95%] sm:max-w-md overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50"><h3 className="font-bold text-gray-800 text-sm">Asignar Curso</h3><button type="button" onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button></div>
                        <form onSubmit={handleAsignarCurso} className="p-4 md:p-6 space-y-4"><div><label className={labelClass}>Curso</label><select required className={inputClass} value={datosAsignacion.cursoMaestroId} onChange={e => setDatosAsignacion({...datosAsignacion, cursoMaestroId: e.target.value})}><option value="">Seleccione...</option>{catalogoCursos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div><button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded font-bold mt-4 text-sm hover:bg-blue-700">Asignar</button></form>
                    </div>
                </div>
            )}

            {isAdminOrHR && showCatalogModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-[95%] sm:w-full sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50"><h3 className="font-bold text-gray-800 text-sm">Catálogo Maestro</h3><button type="button" onClick={() => setShowCatalogModal(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button></div>
                        <div className="p-4 md:p-6 border-b border-gray-100 bg-white"><form onSubmit={handleCrearCursoCatalogo} className="space-y-3"><div><input required type="text" placeholder="Nombre del curso" className={inputClass} value={nuevoCursoMaestro.nombre} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, nombre: e.target.value})} /></div><div><textarea required rows={2} placeholder="Descripción..." className={inputClass} value={nuevoCursoMaestro.descripcion} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, descripcion: e.target.value})} /></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-2"><div><label className={labelClass}>Límite Global</label><input required type="date" className={inputClass} value={nuevoCursoMaestro.fechaLimiteGlobal} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, fechaLimiteGlobal: e.target.value})} /></div><div><label className={labelClass}>Vigencia (Meses)</label><input required type="number" min="1" className={inputClass} value={nuevoCursoMaestro.mesesVigencia} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, mesesVigencia: parseInt(e.target.value) || 12})} /></div><div className="flex items-center pt-5"><label className="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" checked={nuevoCursoMaestro.esGlobal} onChange={e => setNuevoCursoMaestro({...nuevoCursoMaestro, esGlobal: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /><span className="text-xs font-bold text-gray-700">Global</span></label></div></div><button type="submit" className="w-full sm:w-auto px-6 py-2 bg-gray-800 text-white rounded font-bold text-xs hover:bg-gray-900">Añadir al Catálogo</button></form></div>
                        <div className="p-4 md:p-6 overflow-y-auto bg-gray-50 flex-1"><div className="space-y-3">{catalogoCursos.map(c => (<div key={c.id} className="p-4 bg-white border border-gray-200 rounded shadow-sm"><h5 className="font-bold text-gray-800 text-sm">{c.nombre}</h5><p className="text-xs text-gray-500 mt-1">Límite: {c.fechaLimiteGlobal || 'Sin Límite'}</p></div>))}</div></div>
                    </div>
                </div>
            )}
        </div>
    );
};