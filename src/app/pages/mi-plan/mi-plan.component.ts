import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { SuscripcionService } from '../../core/services/suscripcion.service';
import { CuotaValores, CuotasTenant, TenantSuscripcion } from '../../models/suscripcion.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-mi-plan',
  standalone: true,
  imports: [CommonModule, DatePipe, NavbarComponent],
  templateUrl: './mi-plan.component.html',
  styleUrls: ['./mi-plan.component.scss']
})
export class MiPlanComponent implements OnInit {
  plan: TenantSuscripcion | null = null;
  cuotas: CuotasTenant | null = null;
  loading = true;
  error = '';

  readonly cuotaClaves: Array<{ key: keyof CuotaValores; label: string; unidad?: string }> = [
    { key: 'talleres', label: 'Talleres' },
    { key: 'tecnicos', label: 'Tecnicos' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'incidentes_mensuales', label: 'Incidentes mensuales' },
    { key: 'notificaciones_push', label: 'Notificaciones push' },
    { key: 'almacenamiento_gb', label: 'Almacenamiento', unidad: 'GB' }
  ];

  constructor(private suscripcionService: SuscripcionService) {}

  ngOnInit(): void {
    this.cargarPlan();
  }

  cargarPlan(): void {
    this.loading = true;
    this.error = '';

    this.suscripcionService.obtenerMiPlan().subscribe({
      next: plan => {
        this.plan = plan;
        this.cargarCuotas();
      },
      error: err => {
        console.error('ERROR MI PLAN:', err);
        this.error = err.status === 403
          ? 'No tienes permiso para consultar este plan.'
          : err.error?.detail || 'No se pudo cargar la informacion del plan.';
        this.loading = false;
      }
    });
  }

  cargarCuotas(): void {
    this.suscripcionService.obtenerMisCuotas().subscribe({
      next: cuotas => {
        this.cuotas = cuotas;
        this.loading = false;
      },
      error: err => {
        console.error('ERROR MIS CUOTAS:', err);
        this.error = err.error?.detail || 'No se pudieron cargar las cuotas del plan.';
        this.loading = false;
      }
    });
  }

  diasRestantes(): number {
    const fecha = this.plan?.fecha_vencimiento;
    if (!fecha) return 0;
    return Math.max(Math.ceil((new Date(`${fecha}T23:59:59`).getTime() - Date.now()) / 86400000), 0);
  }

  porcentaje(key: keyof CuotaValores): number {
    const limite = Number(this.cuotas?.limites?.[key] || 0);
    const consumo = Number(this.cuotas?.consumo?.[key] || 0);
    if (limite <= 0) return 0;
    return Math.min(Math.round((consumo / limite) * 100), 100);
  }

  estadoClase(): string {
    const estado = String(this.plan?.estado_suscripcion || '').toUpperCase();
    if (estado === 'ACTIVA') return 'active';
    if (estado === 'SUSPENDIDA') return 'suspended';
    return 'expired';
  }
}
