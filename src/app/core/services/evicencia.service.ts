import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class EvidenciaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ✅ CAMBIO: obtiene todas las evidencias de un incidente
  listarPorIncidente(idIncidente: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/evidencias/${idIncidente}`
    );
  }
}