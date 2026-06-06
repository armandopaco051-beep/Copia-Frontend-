export type EstadoCotizacion =
  | 'INVITADA'
  | 'ENVIADA'
  | 'ACEPTADA'
  | 'RECHAZADA'
  | 'VENCIDA'
  | 'AJUSTE_SOLICITADO'
  | 'RETIRADA';

export interface SolicitudCotizacion {
  id?: number;
  codigo?: number;
  id_solicitud?: number;
  id_incidente?: number;
  estado?: EstadoCotizacion | string;
  distancia_km?: number;
  fecha_limite?: string;
  fecha_invitacion?: string;
  latitud?: number;
  longitud?: number;
  direccion?: string;
  descripcion?: string;
  categoria?: string;
  prioridad?: string;
  monto_estimado?: number;
  tiempo_llegada_minutos?: number;
  tiempo_reparacion_minutos?: number;
  descripcion_servicio?: string;
  observacion?: string;
  incidente?: {
    codigo?: number;
    id?: number;
    descripcion?: string;
    latitud?: number;
    longitud?: number;
    direccion?: string;
    categoria?: string;
    prioridad?: string;
    fecha_reporte?: string;
  };
}

export interface ResponderCotizacionPayload {
  monto_estimado: number;
  tiempo_llegada_minutos: number;
  tiempo_reparacion_minutos: number;
  descripcion_servicio: string;
  id_tecnico: string | null;
  observacion?: string;
}

export interface RechazarCotizacionPayload {
  observacion: string;
}
