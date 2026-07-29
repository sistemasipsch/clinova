import { lazy } from 'react';
import ConstructionPage from '../components/ConstructionPage';

// --- MI CUENTA ---
const MiPerfil = lazy(() => import('../modules/miCuenta/pages/MiPerfil').then(m => ({ default: m.MiPerfil })));

// --- TALENTO HUMANO ---
const HojaVida = lazy(() => import('../modules/talentoHumano/pages/HojaVida').then(m => ({ default: m.HojaVida })));
const ReporteUsuarios = lazy(() => import('../modules/talentoHumano/pages/ReporteUsuarios').then(m => ({ default: m.ReporteUsuarios })));
const Organigrama = lazy(() => import('../modules/talentoHumano/pages/Organigrama').then(m => ({ default: m.Organigrama })));
const VerDetalleCargo = lazy(() => import('../modules/talentoHumano/pages/VerDetalleCargo').then(m => ({ default: m.VerDetalleCargo })));
const TipoDocumento = lazy(() => import('../modules/talentoHumano/pages/TipoDocumento').then(m => ({ default: m.TipoDocumento })));
const Incapacidades = lazy(() => import('../modules/talentoHumano/pages/Incapacidades').then(m => ({ default: m.Incapacidades })));
const GestionCursos = lazy(() => import('../modules/talentoHumano/pages/GestionCursos').then(m => ({ default: m.GestionCursos })));
const ReporteSemaforizacion = lazy(() => import('../modules/talentoHumano/pages/ReporteSemaforizacion').then(m => ({ default: m.ReporteSemaforizacion })));

// --- PROCESOS ---
const MapaProcesos = lazy(() => import('../modules/procesos/pages/MapaProcesos').then(m => ({ default: m.MapaProcesos })));
const TipoDocumentos = lazy(() => import('../modules/procesos/pages/TipoDocumentos').then(m => ({ default: m.TipoDocumentos })));
const ListadoUnico = lazy(() => import('../modules/procesos/pages/ListadoUnico').then(m => ({ default: m.ListadoUnico })));
const CrearDocumentoForm = lazy(() => import('../modules/procesos/pages/CrearDocumento').then(m => ({ default: m.CrearDocumentoForm })));
const PerfilesCargos = lazy(() => import('../modules/procesos/pages/PerfilesCargos').then(m => ({ default: m.PerfilesCargos })));

// --- CALIDAD ---
const SolicitarDocumento = lazy(() => import('../modules/calidad/pages/SolicitarDocumento').then(m => ({ default: m.SolicitarDocumento })));
const RevisionDocumento = lazy(() => import('../modules/calidad/pages/RevisionDocumento').then(m => ({ default: m.RevisionDocumento })));
const Reporte = lazy(() => import('../modules/calidad/pages/Reporte').then(m => ({ default: m.Reporte })));
const PapeleraReciclaje = lazy(() => import('../modules/calidad/pages/PapeleraReciclaje').then(m => ({ default: m.PapeleraReciclaje })));
const ListadosUnicos = lazy(() => import('../modules/calidad/pages/ListadosUnicos').then(m => ({ default: m.ListadosUnicos })));
const DocumentosExternos = lazy(() => import('../modules/calidad/pages/DocumentosExternos').then(m => ({ default: m.DocumentosExternos })));
const DiligenciarFormato = lazy(() => import('../modules/calidad/pages/DiligenciarFormato').then(m => ({ default: m.DiligenciarFormato })));
const Definiciones = lazy(() => import('../modules/calidad/pages/Definiciones').then(m => ({ default: m.Definiciones })));

// --- CONFIGURACIÓN ---
const TipoContrato = lazy(() => import('../modules/configuracion/pages/TipoContrato').then(m => ({ default: m.TipoContrato })));
const Usuarios = lazy(() => import('../modules/configuracion/pages/Usuarios').then(m => ({ default: m.Usuarios })));
const GestionCargos = lazy(() => import('../modules/configuracion/pages/GestionCargos').then(m => ({ default: m.GestionCargos })));
const AdministracionVacunas = lazy(() => import('../modules/configuracion/pages/AdministracionVacunas').then(m => ({ default: m.AdministracionVacunas })));
const PlantillasCorreo = lazy(() => import('../modules/configuracion/pages/PlantillasCorreo').then(m => ({ default: m.PlantillasCorreo })));
const GestionOpciones = lazy(() => import('../modules/configuracion/pages/GestionOpciones').then(m => ({ default: m.GestionOpciones })));

// --- ACTAS E INFORMES ---
const GestionActas = lazy(() => import('../modules/actasInformes/pages/GestionActas').then(m => ({ default: m.GestionActas })));
const CrearPlantilla = lazy(() => import('../modules/actasInformes/pages/CrearPlantilla').then(m => ({ default: m.CrearPlantilla })));
const CrearActa = lazy(() => import('../modules/actasInformes/pages/CrearActa').then(m => ({ default: m.CrearActa })));
const ActaDetalle = lazy(() => import('../modules/actasInformes/pages/ActaDetalle').then(m => ({ default: m.ActaDetalle })));
const Informes = lazy(() => import('../modules/actasInformes/pages/Informes').then(m => ({ default: m.Informes })));

// --- CONTEXTO DE LA ORGANIZACIÓN ---
const AnalisisList = lazy(() => import('../modules/contexto/pages/AnalisisList').then(m => ({ default: m.AnalisisList })));
const PartesList = lazy(() => import('../modules/contexto/pages/PartesList').then(m => ({ default: m.PartesList })));
const RequisitosList = lazy(() => import('../modules/contexto/pages/RequisitosList').then(m => ({ default: m.RequisitosList })));

// --- HOJAS DE VIDA ---
const HojaVidaList = lazy(() => import('../modules/hojasVida/pages/HojaVidaList').then(m => ({ default: m.HojaVidaList })));

export const ROUTES = {
  MI_CUENTA: {
    MI_PERFIL: { path: '/miCuenta/mi-perfil', title: 'Mi Perfil', element: <MiPerfil /> },
  },
  HOJAS_DE_VIDA: {
    NOMINA: { path: '/hojasDeVida/nomina', title: 'Hojas de Vida - Nómina', element: <HojaVidaList tipoSubmodulo="NOMINA" /> },
    PROVEEDORES: { path: '/hojasDeVida/proveedores', title: 'Hojas de Vida - Proveedores', element: <HojaVidaList tipoSubmodulo="PROVEEDORES" /> },
  },
  TALENTO_HUMANO: {
    HOJA_VIDA: { path: '/talentoHumano/hoja-de-vida', title: 'Hoja de Vida', element: <HojaVida /> },
    REPORTE_ESTADOS: { path: '/talentoHumano/reporte-estados', title: 'Reporte de Estados', element: <ReporteUsuarios /> },
    REPORTE_SEMAFORIZACION: { path: '/talentoHumano/reporte-semaforizacion', title: 'Semaforización', element: <ReporteSemaforizacion /> },
    ORGANIGRAMA: { path: '/talentoHumano/organigrama', title: 'Organigrama', element: <Organigrama /> },
    VER_DETALLE: { path: '/talentoHumano/perfiles-cargo/:id', title: 'Detalle de Cargo', element: <VerDetalleCargo /> },
    TIPO_DOCUMENTO: { path: '/talentoHumano/tipo-documento', title: 'Tipo de Documento', element: <TipoDocumento /> },
    INCAPACIDADES: { path: '/talentoHumano/incapacidades', title: 'Incapacidad, ausentismo y licencias', element: <Incapacidades /> },
    CURSOS: { path: '/talentoHumano/cursos', title: 'Gestión de Cursos', element: <GestionCursos /> },
  },
  PROCESOS: {
    MAPA_PROCESOS: { path: '/procesos/mapa', title: 'Mapa de Procesos', element: <MapaProcesos /> },
    TIPOS_DOCUMENTOS: { path: '/procesos/tipos-documentos', title: 'Tipos de Documento', element: <TipoDocumentos /> }, 
    LISTADO_UNICO: { path: '/procesos/listado-unico', title: 'Listado Único', element: <ListadoUnico /> },
    CREAR_DOCUMENTO: { path: '/procesos/crear-documento', title: 'Crear Documento', element: <CrearDocumentoForm /> },
    PERFILES_CARGO: { path: '/procesos/perfiles-cargo', title: 'Perfiles de Cargo', element: <PerfilesCargos /> },
  },
  CALIDAD: {
    SOLICITAR_DOCUMENTO: { path: '/calidad/solicitar-documento', title: 'Solicitar Documento', element: <SolicitarDocumento /> },
    REVISION_DOCUMENTO: { path: '/calidad/revision-documento', title: 'Revisión por documento', element: <RevisionDocumento /> },
    REPORTES: { path: '/calidad/reportes', title: 'Reportes de Calidad', element: <Reporte /> },
    PAPELERA: { path: '/calidad/papelera-reciclaje', title: 'Papelera de Reciclaje', element: <PapeleraReciclaje /> },
    LISTADO_UNICO: { path: '/calidad/listado-unico', title: 'Listado Único', element: <ListadosUnicos /> },
    DOCUMENTOS_EXTERNOS: { path: '/calidad/documentos-externos', title: 'Documentos Externos', element: <DocumentosExternos /> },
    DILIGENCIAR_FORMATO: { path: '/calidad/diligenciar-formato', title: 'Diligenciar Formato', element: <DiligenciarFormato /> },
    DEFINICIONES: { path: '/calidad/definiciones', title: 'Definiciones', element: <Definiciones /> },
  },
  CONFIGURACION: {
    USUARIOS: { path: '/configuracion/usuarios', title: 'Gestión de Usuarios', element: <Usuarios /> },
    MACROPROCESOS: { path: '/configuracion/macroprocesos', title: 'Gestión de Macroprocesos', element: <ConstructionPage title="Gestión de Macroprocesos" /> },
    GRUPOS_DISTRIBUCION: { path: '/configuracion/grupos-distribucion', title: 'Grupos de Distribución', element: <ConstructionPage title="Grupos de Distribución" /> },
    CARGOS: { path: '/configuracion/cargos', title: 'Gestión de Cargos y Objetos', element: <GestionCargos /> },
    OPCIONES: { path: '/configuracion/opciones', title: 'Gestión de Opciones', element: <GestionOpciones /> },
    TIPO_CONTRATO: { path: '/configuracion/tipo-contrato', title: 'Gestión de Tipo Contrato', element: <TipoContrato title="Gestión de Tipo Contrato" /> },
    VACUNAS: { path: '/configuracion/vacunas', title: 'Administración de Vacunas', element: <AdministracionVacunas /> },
    PLANTILLAS_CORREO: { path: '/configuracion/plantillas-correo', title: 'Plantillas de Correo', element: <PlantillasCorreo /> }
  },
  ACTAS_INFORMES: {
    GESTION_ACTAS: { path: '/actas-informes/gestion', title: 'Gestión de Actas', element: <GestionActas /> },
    CREAR_PLANTILLA: { path: '/actas-informes/crear-plantilla', title: 'Crear Plantilla', element: <CrearPlantilla /> },
    CREAR_ACTA: { path: '/actas-informes/crear-acta', title: 'Crear Acta', element: <CrearActa /> },
    ACTA_DETALLE: { path: '/actas-informes/acta/:id', title: 'Detalle de Acta', element: <ActaDetalle /> },
    INFORMES: { path: '/actas-informes/informes', title: 'Informes', element: <Informes /> }
  },
  CONTEXTO: {
    ANALISIS: { path: '/contexto/analisis', title: 'Análisis de Contexto', element: <AnalisisList /> },
    PARTES: { path: '/contexto/partes', title: 'Partes Interesadas', element: <PartesList /> },
    REQUISITOS: { path: '/contexto/requisitos', title: 'Requisitos Legales', element: <RequisitosList /> }
  }
};