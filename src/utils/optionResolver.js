/**
 * Resolver unificado para opciones de ARL, EPS, AFP, Caja de Compensación.
 * La base de datos ya contiene los nombres completos originales del backup de Kawak.
 * Este resolver solo traduce códigos numéricos legacy en caso de que existan.
 * Los nombres Kawak se devuelven tal cual sin modificación.
 */

export const RESOLVEDOR_OPCIONES = {
    arl: {
        '1': 'Positiva Compañía de Seguros S.A.',
        '2': 'ARL Sura',
        '3': 'Seguros Bolívar S.A.',
        '4': 'Colmena S.A. Compañía de Seguros de Vida',
        '5': 'Seguros ALFA S.A. y Seguros de Vida ALFA S.A.',
        '8': 'Axa Colpatria Seguros S.A.',
    },
    eps: {
        '1': 'EPS016 - COOMEVA ENTIDAD PROMOTORA DE SALUD S.A.',
        '2': 'EPS037 - NUEVA EPS S.A - NUEVA EMPRESA PROMOTORA DE SALUD NUEVA EPS S.A',
        '3': 'EPS005 - ENTIDAD PROMOTORA DE SALUD SANITAS S.A.',
        '4': 'EPS005 - ENTIDAD PROMOTORA DE SALUD SANITAS S.A.',
        '5': 'EPS008 - COMPENSAR ENTIDAD PROMOTORA DE SALUD',
        '7': 'MEDIMAS EPS',
        '11': 'COOSALUD E.S.S ARS',
        '17': 'EPS002 - SALUD TOTAL S.A. ENTIDAD PROMOTORA DE SALUD',
    },
    afp: {
        '1': 'Administradora Colombiana de Pensiones Colpensiones',
        '2': 'Porvenir',
        '3': 'Protección',
        '4': 'Colfondos',
        '10': 'Fondo Obligatorio de Pensiones Skandia'
    },
    caja: {
        '1': 'COMPENSAR',
        '2': 'COLSUBSIDIO',
        '3': 'CAFAM',
        '4': 'COMFENALCO',
        '5': 'COMFAMA',
        '6': 'CAJACOPI',
        '7': 'COMFAORIENTE'
    }
};

/**
 * Resuelve un valor de opción: si es un código numérico legacy, lo traduce.
 * Si ya es un nombre completo de Kawak, lo devuelve tal cual.
 * @param {string} val - El valor a resolver
 * @param {string} categoryKey - La categoría (arl, eps, afp, caja)
 * @param {boolean} fallbackToDash - Si true, devuelve '—' cuando no hay valor
 * @returns {string}
 */
export const resolveOptionLabel = (val, categoryKey, fallbackToDash = false) => {
    if (!val || val === 'null' || val === 'undefined') return fallbackToDash ? '—' : '';
    const trimmed = String(val).trim();
    if (!trimmed || trimmed === '—') return fallbackToDash ? '—' : '';

    const cat = (categoryKey || '').toLowerCase();
    const map = RESOLVEDOR_OPCIONES[cat];
    if (map && map[trimmed]) {
        return map[trimmed];
    }

    // Already a Kawak full name - pass through
    return trimmed;
};
