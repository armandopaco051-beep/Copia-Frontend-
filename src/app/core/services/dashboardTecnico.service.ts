import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';
import { TecnicoDashboardResumen, IncidenteTecnicoActual, HistorialTecnicoItem } from '../../models/dashboard_tecnicos.model';



@Injectable({
  providedIn: 'root'
})
export class TecnicoDashboardService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient){

  }
   // ✅ CAMBIO: agrega token para endpoints protegidos
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('token enviado al backend', token)

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
  obtenerResumen(): Observable<TecnicoDashboardResumen>{
    return this.http.get<TecnicoDashboardResumen>(`${this.apiUrl}/tecnicos/dashboard`, { headers: this.getHeaders() });
  }
  obtenerAsignacionActual() : Observable<IncidenteTecnicoActual | null>{
    return this.http.get<IncidenteTecnicoActual | null>(`${this.apiUrl}/tecnicos/asignacion-actual`, { headers: this.getHeaders() });
  }
  obtenerHistorial() : Observable<HistorialTecnicoItem[]>{
    return this.http.get<HistorialTecnicoItem[]>(`${this.apiUrl}/tecnicos/historial`, { headers: this.getHeaders() });
  }
  iniciarRuta(idAsignacion : number) : Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/asignacion/${idAsignacion}/iniciar-ruta`, {}, { headers: this.getHeaders() });
  }
  finalizarServicio(idAsignacion : number) : Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/asignacion/${idAsignacion}/finalizar`, {}, { headers: this.getHeaders() });
  }
}