import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';
import {
  CrearTenantPayload,
  CuotasTenant,
  EstadoSuscripcion,
  PlanSuscripcion,
  TenantSuscripcion
} from '../../models/suscripcion.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionService {
  private apiUrl = `${environment.apiUrl}/suscripciones`;

  constructor(private http: HttpClient) {}

  obtenerPlanEstandar(): Observable<PlanSuscripcion> {
    return this.http.get<PlanSuscripcion>(`${this.apiUrl}/plan-estandar`);
  }

  listarTenants(): Observable<TenantSuscripcion[]> {
    return this.http.get<any>(`${this.apiUrl}/tenants`).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        return response?.tenants || response?.data || [];
      })
    );
  }

  crearTenant(payload: CrearTenantPayload): Observable<TenantSuscripcion> {
    return this.http.post<TenantSuscripcion>(`${this.apiUrl}/tenants`, payload);
  }

  obtenerTenant(idTenant: number): Observable<TenantSuscripcion> {
    return this.http.get<TenantSuscripcion>(`${this.apiUrl}/tenants/${idTenant}`);
  }

  obtenerCuotasTenant(idTenant: number): Observable<CuotasTenant> {
    return this.http.get<CuotasTenant>(`${this.apiUrl}/tenants/${idTenant}/cuotas`);
  }

  renovarTenant(idTenant: number, duracionDias: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenants/${idTenant}/renovar`, {
      duracion_dias: duracionDias
    });
  }

  cambiarEstado(idTenant: number, estado: EstadoSuscripcion): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenants/${idTenant}/estado`, { estado });
  }

  obtenerMiPlan(): Observable<TenantSuscripcion> {
    return this.http.get<TenantSuscripcion>(`${this.apiUrl}/mi-plan`);
  }

  obtenerMisCuotas(): Observable<CuotasTenant> {
    return this.http.get<CuotasTenant>(`${this.apiUrl}/mi-plan/cuotas`);
  }

  resolverDominio(dominio: string): Observable<any> {
    const params = new HttpParams().set('dominio', dominio);
    return this.http.get<any>(`${this.apiUrl}/resolver-dominio`, { params });
  }
}
