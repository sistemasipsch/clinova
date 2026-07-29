/**
 * Configuración central de la URL base del backend.
 * Soporta variable VITE_API_URL o fallback a túnel de Cloudflare / localhost.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://interference-purse-jones-convinced.trycloudflare.com';
