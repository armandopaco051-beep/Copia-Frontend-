import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AsignacionService } from '../../core/services/asignacion.service';
import { TecnicoService } from '../../core/services/tecnico.service';
import { EvidenciaService } from '../../core/services/evicencia.service';
import { environment } from '../../../enviroments/enviroments';

@Component({
  selector: 'app-incidentes-taller',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, NavbarComponent],
  templateUrl: './incidentes-taller.component.html',
  styleUrls: ['./incidentes-taller.component.scss']
})
export class IncidentesTallerComponent implements OnInit {
  idTaller = 0;
  loading = true;
  error = '';

  // ✅ CAMBIO: lista de asignaciones/incidentes del taller
  incidentes: any[] = [];

  // ✅ CAMBIO: modal detalle
  mostrarDetalle = false;
  incidenteSeleccionado: any = null;

  // ✅ CAMBIO: modal asignar técnico
  mostrarAsignarTecnico = false;
  asignacionSeleccionada: any = null;
  tecnicosDisponibles: any[] = [];
  tecnicoSeleccionado = '';
  evidencias :any[] =[]; 
  loadingEvidencias = false ; 
  errorEvidencia = ''; 


  categorias: Record<number, string> = {
    1: 'Batería descargada',
    2: 'Llanta pinchada',
    3: 'Falla de motor',
    4: 'Sobrecalentamiento',
    5: 'Accidente leve',
    6: 'Falta de combustible',
    7: 'Cerrajería vehicular',
    8: 'No arranca',
    9: 'Falla eléctrica',
    10: 'Otro problema'
  };

  prioridades: Record<number, string> = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
    4: 'Crítica'
  };

  constructor(
    private asignacionService: AsignacionService,
    private tecnicoService: TecnicoService,
    private evidenciaService : EvidenciaService
  ) {}

  ngOnInit(): void {
    const idTallerStorage = localStorage.getItem('id_taller');

    console.log('ID TALLER STORAGE:', idTallerStorage);

    if (!idTallerStorage || idTallerStorage === 'null' || idTallerStorage === 'undefined') {
      this.loading = false;
      this.error = 'No se encontró el taller del usuario logueado';
      return;
    }

    this.idTaller = Number(idTallerStorage);

    if (!this.idTaller || isNaN(this.idTaller)) {
      this.loading = false;
      this.error = 'El id del taller no es válido';
      return;
    }

    this.cargarIncidentes();
    this.cargarTecnicosDisponibles();
  }

  // ✅ CAMBIO: carga las solicitudes que llegaron a este taller
  cargarIncidentes(): void {
    this.loading = true;
    this.error = '';

    console.log('ID TALLER USADO:', this.idTaller);

    this.asignacionService.listarPorTaller(this.idTaller).subscribe({
      next: (data: any[]) => {
        console.log('INCIDENTES DEL TALLER:', data);
        this.incidentes = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('ERROR INCIDENTES:', err);
        this.error = err.error?.detail || 'No se pudieron cargar los incidentes.';
        this.loading = false;
      }
    });
  }

  // ✅ CAMBIO: obtiene técnicos disponibles del taller
  cargarTecnicosDisponibles(): void {
    this.tecnicoService.listarMisTecnicos().subscribe({
      next: (data: any[]) => {
        this.tecnicosDisponibles = (data || []).filter(t => t.disponibilidad === true);
        console.log('TÉCNICOS DISPONIBLES:', this.tecnicosDisponibles);
      },
      error: (err: any) => {
        console.error('ERROR TÉCNICOS:', err);
      }
    });
  }

  // ✅ CAMBIO: aceptar solicitud. Luego abre directamente asignación de técnico.
  aceptarSolicitud(item: any): void {
    const idAsignacion = item.id;

    if (!idAsignacion) {
      alert('No se encontró la asignación');
      return;
    }

    this.asignacionService.aceptarAsignacion(idAsignacion).subscribe({
      next: () => {
        item.id_estado_asignacion = 2; // ✅ CAMBIO: localmente queda aceptada
        this.abrirAsignarTecnico(item); // ✅ CAMBIO: abrir selección de técnico
        this.cargarIncidentes(); 
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.detail || 'Error al aceptar la solicitud');
      }
    });
  }

  // ✅ CAMBIO: rechazar solicitud. El backend buscará el siguiente taller.
  rechazarSolicitud(item: any): void {
    const idAsignacion = item.id;

    if (!idAsignacion) {
      alert('No se encontró la asignación');
      return;
    }

    const observacion = prompt('Motivo del rechazo:');

    if (!observacion) return;

    this.asignacionService.rechazarAsignacion(idAsignacion, observacion).subscribe({
      next: (resp: any) => {
        alert(resp.mensaje || 'Solicitud rechazada');
        this.cargarIncidentes(); // ✅ CAMBIO: desaparece de este taller si fue rechazada
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.detail || 'Error al rechazar la solicitud');
      }
    });
  }

  // ✅ CAMBIO: abrir modal de asignar técnico
  abrirAsignarTecnico(item: any): void {
    this.asignacionSeleccionada = item;
    this.tecnicoSeleccionado = '';
    this.mostrarAsignarTecnico = true;
    this.cargarTecnicosDisponibles();
  }

  // ✅ CAMBIO: cerrar modal de asignar técnico
  cerrarAsignarTecnico(): void {
    this.asignacionSeleccionada = null;
    this.tecnicoSeleccionado = '';
    this.mostrarAsignarTecnico = false;
  }

  // ✅ CAMBIO: confirmar técnico seleccionado
  confirmarAsignacionTecnico(): void {
      if (!this.asignacionSeleccionada) {
            alert('No se encontró la asignación');
            return;
        }

        if (!this.tecnicoSeleccionado) {
            alert('Selecciona un técnico disponible');
            return;
        }

        // ✅ CAMBIO: aseguramos que el id sea número
        const idAsignacion = Number(this.asignacionSeleccionada.id);

        // ✅ CAMBIO: aseguramos que el código del técnico sea texto
        const codigoTecnico = String(this.tecnicoSeleccionado).trim();

        console.log('ASIGNACIÓN SELECCIONADA:', this.asignacionSeleccionada);
        console.log('ID ASIGNACIÓN:', idAsignacion);
        console.log('CÓDIGO TÉCNICO:', codigoTecnico);

        // ✅ CAMBIO: validación extra para evitar enviar undefined o NaN
        if (!idAsignacion || isNaN(idAsignacion)) {
            alert('El ID de asignación no es válido');
            return;
        }

        if (!codigoTecnico) {
            alert('El código del técnico no es válido');
            return;
        }

        this.asignacionService.asignarTecnico(idAsignacion, codigoTecnico).subscribe({
            next: (resp: any) => {
            console.log('RESPUESTA ASIGNAR TÉCNICO:', resp);
            alert('Técnico asignado correctamente');
            this.cerrarAsignarTecnico();
            this.cargarIncidentes();
            },
            error: (err: any) => {
            //console.error('ERROR ASIGNAR TÉCNICO:', err);
            alert(err.error?.detail || 'Error al asignar técnico');
            }
        });
        }

  // ✅ CAMBIO: abrir detalle
  verDetalle(item: any): void {
    this.incidenteSeleccionado = item;
    this.mostrarDetalle = true;
    this.evidencias =[]; 
    this.errorEvidencia = ''; 
    const idIncidente = Number(item.id_incidente); 
    if (!idIncidente || isNaN(idIncidente)) {
      alert('El ID del incidente no es válido');
      return;
    }
    this.cargarEvidencias(idIncidente); 
  }

  cargarEvidencias(idIncidente : number): void{
    this.loadingEvidencias = true;
    this.errorEvidencia = '';

    this.evidenciaService.listarPorIncidente(idIncidente).subscribe({
    next: (data: any[]) => {
      console.log('EVIDENCIAS DEL INCIDENTE:', data);
      this.evidencias = data || [];
      this.loadingEvidencias = false;
    },
    error: (err: any) => {
      console.error('ERROR CARGANDO EVIDENCIAS:', err);
      this.errorEvidencia = err.error?.detail || 'No se pudieron cargar las evidencias.';
      this.loadingEvidencias = false;
    }
  });
  }
  // ✅ CAMBIO: cerrar detalle
  cerrarDetalle(): void {
    this.incidenteSeleccionado = null;
    this.mostrarDetalle = false;

    this.evidencias = [];
    this.errorEvidencia = '';
    this.loadingEvidencias = false;
  }

  // ✅ CAMBIO: ubicación solo desde el detalle
  verUbicacion(item: any): void {
    const lat = this.getLatitud(item);
    const lng = this.getLongitud(item);

    if (!lat || !lng) {
      alert('Este incidente no tiene ubicación válida.');
      return;
    }

    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }

  getDescripcion(item: any): string {
    return String(
      item.incidente?.descripcion ||
      item.descripcion ||
      'Sin descripción'
    );
  }

  getCategoria(item: any): string {
    const idCategoria = Number(
      item.incidente?.id_categoria ||
      item.incidente?.id_categoria_problema ||
      item.id_categoria ||
      10
    );

    return this.categorias[idCategoria] || 'Otro problema';
  }

  getPrioridad(item: any): string {
    const idPrioridad = Number(
      item.incidente?.id_prioridad ||
      item.id_prioridad ||
      2
    );

    return this.prioridades[idPrioridad] || 'Media';
  }

  getClasePrioridad(item: any): string {
    const idPrioridad = Number(
      item.incidente?.id_prioridad ||
      item.id_prioridad ||
      2
    );

    if (idPrioridad === 4) return 'prioridad-alta';
    if (idPrioridad === 3) return 'prioridad-alta';
    if (idPrioridad === 2) return 'prioridad-media';
    return 'prioridad-baja';
  }

  getEstadoAsignacion(item: any): string {
    const estado = Number(item.id_estado_asignacion);

    if (estado === 1) return 'Pendiente';
    if (estado === 2) return 'Aceptada';
    if (estado === 3) return 'Rechazada';
    if (estado === 4) return 'Asignada a técnico';
    if (estado === 5) return 'En camino';
    if (estado === 6) return 'Finalizada';
    if (estado === 7) return 'Cancelada';
    if (estado === 8) return 'Sin taller disponible';

    return 'Pendiente';
  }

  getFecha(item: any): string {
    return String(
      item.incidente?.fecha_reporte ||
      item.fecha_asignacion ||
      ''
    );
  }

  getLatitud(item: any): number {
    return Number(item.incidente?.latitud || item.latitud || 0);
  }

  getLongitud(item: any): number {
    return Number(item.incidente?.longitud || item.longitud || 0);
  }

  // ✅ CAMBIO: datos del cliente desde backend
  getNombreSolicitante(item: any): string {
    const usuario = item.incidente?.usuario || item.usuario || item.cliente || {};
    const nombreCompleto = `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim();

    return nombreCompleto || 'No enviado por backend';
  }

  getTelefonoSolicitante(item: any): string {
    const usuario = item.incidente?.usuario || item.usuario || item.cliente || {};
    return usuario.telefono || 'No enviado por backend';
  }

  getCorreoSolicitante(item: any): string {
    const usuario = item.incidente?.usuario || item.usuario || item.cliente || {};
    return usuario.email || 'No enviado por backend';
  }
  getUrlArchivo(evidencia: any): string {
  if (!evidencia?.url_archivo) return '';

  let ruta = String(evidencia.url_archivo).replaceAll('\\', '/');

  // ✅ Si ya viene con http, la dejamos igual
  if (ruta.startsWith('http')) {
    return ruta;
  }

  // ✅ Quita slash inicial si viene con /uploads
  if (ruta.startsWith('/')) {
    ruta = ruta.substring(1);
  }

  return `${environment.apiUrl}/${ruta}`;
  }

  esImagen(evidencia: any): boolean {
  return Number(evidencia.id_tipo_evidencia) === 1;
  }

  esAudio(evidencia: any): boolean {
    return Number(evidencia.id_tipo_evidencia) === 2;
  }

  esTexto(evidencia: any): boolean {
    return Number(evidencia.id_tipo_evidencia) === 3;
  }

}