/**
 * Configuración central de la URL base del backend en producción.
 * Subdominio permanente de Cloudflare Tunnel: clinovaapi.clinicalhouse.co
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://clinovaapi.clinicalhouse.co';
