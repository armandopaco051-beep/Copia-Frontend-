import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TecnicoDashboardService } from '../../core/services/dashboardTecnico.service';
import { TrackingService } from '../../core/services/tracking.service';
@Component({
  selector: 'app-tecnico-incidentes',
  standalone: true,
  imports: [CommonModule, DatePipe, NavbarComponent],
  templateUrl: './tecnico_incidente.component.html',
  styleUrl: './tecnico_incidente.component.scss'
})
export class TecnicoIncidentesComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';

  // ✅ CAMBIO: ya no hay datos quemados
  incidenteActual: any | null = null;
  intervalUbicacion: any = null; 

  constructor(
    private tecnicoService: TecnicoDashboardService,
    private trackingService: TrackingService
  ) {}

  ngOnInit(): void {
    this.cargarIncidenteActual();
  }

  // ✅ CAMBIO: carga el incidente real asignado al técnico logueado
  cargarIncidenteActual(): void {
    this.loading = true;
    this.error = '';

    this.tecnicoService.obtenerAsignacionActual().subscribe({
      next: (data: any | null) => {
        console.log('INCIDENTE ACTUAL TÉCNICO:', data);
        this.incidenteActual = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('ERROR INCIDENTE ACTUAL:', err);
        this.error = err.error?.detail || 'No se pudo cargar el incidente actual.';
        this.loading = false;
      }
    });
  }

  verUbicacion(): void {
    if (!this.incidenteActual) return;

    const lat = this.incidenteActual.latitud;
    const lng = this.incidenteActual.longitud;

    if (!lat || !lng) {
      alert('Este incidente no tiene ubicación válida.');
      return;
    }

    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  }

  iniciarRuta(): void {
    if (!this.incidenteActual) {
      alert('No hay incidente asignado.');
      return;
    }
    const idAsignacion = Number(this.incidenteActual.id_asignacion)
    const estado = Number(this.incidenteActual.id_estado_asignacion)
    if (!idAsignacion || isNaN(idAsignacion)) {
      alert('ID de asignación inválido.');
      return;
    }
    const latCliente = Number(this.incidenteActual.latitud)
    const lngCliente = Number(this.incidenteActual.longitud)
    if (!latCliente || !lngCliente) {
      alert('Coordenadas del cliente inválidas.');
      return;
    }
    //si ya estas en camino que no vuelva a ver el backend :
    if (estado == 5){
        this.abrirRutaEnMapa(latCliente, lngCliente);
        this.iniciarTrackingUbicacion();
        return;
    }
    if (estado == 4){
        alert('este incidente no esta listo para iniciar ruta');
        return;
    }

    this.tecnicoService.iniciarRuta(idAsignacion).subscribe({
      next: (resp: any) => {
        console.log('Ruta iniciada correctamente', resp); 
        this.incidenteActual.id_estado_asignacion = 5; 
        this.incidenteActual.estado = 'En camino'; 
        this.iniciarTrackingUbicacion(); 
        this.abrirRutaEnMapa(latCliente, lngCliente);
        this.cargarIncidenteActual();
      },
      error: (err: any) => {
        console.error('ERROR INICIAR RUTA:', err);
        alert(err.error?.detail || 'Error al iniciar ruta.');
      }
    });
  }

  finalizarServicio(): void {
    if (!this.incidenteActual) {
      alert('No hay incidente asignado.');
      return;
    }
    const idAsignacion = Number(this.incidenteActual.id_asignacion); 
    if (!idAsignacion || isNaN(idAsignacion)) {
      alert('ID de asignación inválido.');
      return;
    }

    const confirmar = confirm('¿Seguro que deseas finalizar este servicio?');

    if (!confirmar) return;

    this.tecnicoService.finalizarServicio(this.incidenteActual.id_asignacion).subscribe({
      next: () => {
        alert('Servicio finalizado correctamente.');
        this.detenerTrackingUbicacion(); 
        this.cargarIncidenteActual();
      },
      error: (err: any) => {
        console.error('ERROR FINALIZAR SERVICIO:', err);
        alert(err.error?.detail || 'Error al finalizar servicio.');
      }
    });
  }
  abrirRutaEnMapa(latCliente: number, lngCliente: number): void {
  if (!navigator.geolocation) {
    // ✅ Si no hay geolocalización, abre Google Maps solo con destino
    const urlDestino = `https://www.google.com/maps/dir/?api=1&destination=${latCliente},${lngCliente}&travelmode=driving`;
    window.open(urlDestino, '_blank');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latTecnico = position.coords.latitude;
      const lngTecnico = position.coords.longitude;

      // ✅ Ruta desde ubicación actual del técnico hasta el cliente
      const urlRuta = `https://www.google.com/maps/dir/?api=1&origin=${latTecnico},${lngTecnico}&destination=${latCliente},${lngCliente}&travelmode=driving`;

      window.open(urlRuta, '_blank');
    },
    () => {
      // ✅ Si el técnico no da permiso de ubicación, igual abrimos Maps con el destino
      const urlDestino = `https://www.google.com/maps/dir/?api=1&destination=${latCliente},${lngCliente}&travelmode=driving`;
      window.open(urlDestino, '_blank');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}
iniciarTrackingUbicacion(): void {
    if (this.intervalUbicacion){
        console.log('Tracking de ubicación ya está activo');
        return;
    }
    console.log(this.incidenteActual);
  if (!this.incidenteActual) {
    return;
  }

  const idAsignacion = Number(this.incidenteActual.id_asignacion);

  if (!idAsignacion || isNaN(idAsignacion)) {
    console.error('ID de asignación inválido para tracking');
    return;
  }

  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización.');
    return;
  }

  // ✅ Enviar una vez inmediatamente
  this.enviarUbicacionActual();

  // ✅ Luego enviar cada 5 segundos
  this.intervalUbicacion = setInterval(() => {
    this.enviarUbicacionActual();
  }, 5000);
}


enviarUbicacionActual(): void {
  if (!this.incidenteActual) {
    return;
  }

  const idAsignacion = Number(this.incidenteActual.id_asignacion);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitud = position.coords.latitude;
      const longitud = position.coords.longitude;

      this.trackingService.enviarUbicacion({
        id_asignacion: idAsignacion,
        latitud,
        longitud
      }).subscribe({
        next: (resp) => {
          console.log('Ubicación enviada:', resp);
        },
        error: (err) => {
          console.error('Error enviando ubicación:', err);
        }
      });
    },
    (error) => {
      console.error('Error obteniendo ubicación:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}


detenerTrackingUbicacion(): void {
  if (this.intervalUbicacion) {
    clearInterval(this.intervalUbicacion);
    this.intervalUbicacion = null;
  }
}


ngOnDestroy(): void {
  this.detenerTrackingUbicacion();
}
}


