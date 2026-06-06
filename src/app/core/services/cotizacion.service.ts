import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../enviroments/enviroments';
import {
  RechazarCotizacionPayload,
  ResponderCotizacionPayload,
  SolicitudCotizacion
} from '../../models/cotizacion.model';

@Injectable({ providedIn: 'root' })
export class CotizacionService {
  private apiUrl = `${environment.apiUrl}/cotizaciones`;

  constructor(private http: HttpClient) {}

  listarMisSolicitudes(): Observable<SolicitudCotizacion[]> {
    return this.http.get<any>(`${this.apiUrl}/mis-solicitudes`).pipe(
      map(response => {
        if (Array.isArray(response)) return response;
        return response?.solicitudes || response?.cotizaciones || response?.data || [];
      })
    );
  }

  responder(idSolicitud: number, payload: ResponderCotizacionPayload): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/solicitudes/${idSolicitud}/responder`,
      payload
    );
  }

  rechazar(idSolicitud: number, payload: RechazarCotizacionPayload): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/solicitudes/${idSolicitud}/rechazar`,
      payload
    );
  }
}
