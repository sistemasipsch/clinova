/**
 * Configuración central de la URL base del backend en producción.
 * Túnel permanente e infinito: api.clinicalhouse.co
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.clinicalhouse.co';
