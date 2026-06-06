export type EstadoSuscripcion = 'ACTIVA' | 'VENCIDA' | 'SUSPENDIDA' | 'CANCELADA';

export interface PlanSuscripcion {
  id: number;
  nombre: string;
  duracion_dias: number;
  precio: number;
  dominio_incluido: boolean;
  dominio_personalizado: boolean;
  estado: string;
  limite_talleres: number;
  limite_tecnicos: number;
  limite_usuarios: number;
  limite_incidentes_mensuales: number;
  limite_notificaciones_push: number;
  limite_almacenamiento_gb: number;
}

export interface TenantSuscripcion {
  id: number;
  nombre: string;
  slug: string;
  id_taller: number;
  estado: string;
  fecha_creacion: string;
  dominio: string;
  estado_dominio: string;
  id_suscripcion: number;
  estado_suscripcion: EstadoSuscripcion | string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  plan?: PlanSuscripcion;
}

export interface CuotaValores {
  talleres: number;
  tecnicos: number;
  usuarios: number;
  incidentes_mensuales: number;
  notificaciones_push: number;
  almacenamiento_gb: number;
}

export interface CuotasTenant {
  id_tenant: number;
  id_taller: number;
  periodo: string;
  estado_suscripcion: string;
  fecha_vencimiento: string;
  limites: CuotaValores;
  consumo: CuotaValores;
  excedidos: Record<keyof CuotaValores, boolean>;
}

export interface CrearTenantPayload {
  nombre: string;
  slug: string;
  dominio: string;
  id_taller: number;
  tipo_dominio: 'SUBDOMINIO' | 'PERSONALIZADO';
}
