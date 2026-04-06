import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-casas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './casas.html',
  styleUrl: './casas.css'
})
export class CasasComponent implements OnInit {
  public casas: any[] = [];
  public areas: any[] = [];
  public residentes: any[] = [];
  public searchText: string = '';
  public isDarkMode: boolean = false;
  public user: any = null;

  // Estados de edición
  public editando: boolean = false;
  public idSeleccionado: any = null;

  public nuevaCasa = {
    numero_casa: '',
    id_area: '',
    propietario: '',
    telefono: '',
    estado: 'ocupada'
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private exportService: ExportService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const session = localStorage.getItem('usuarioLogueado');
      if (!session) {
        this.router.navigate(['/login']);
        return;
      }
      this.user = JSON.parse(session);
      this.isDarkMode = document.body.classList.contains('dark-mode');

      this.cargarCasas();
      this.cargarAreas();
      this.cargarResidentes();
    }
  }

  cargarCasas() {
    this.apiService.getCasas().subscribe({
    next: (res: any) => {
      this.casas = [...res]; // 👈 esto fuerza a Angular a refrescar la vista
      this.cd.detectChanges();
    },
    error: (err: any) => console.error("Error al cargar casas:", err)
  });
}

  cargarAreas() {
    this.apiService.getAreas().subscribe({
      next: (res: any) => this.areas = res,
      error: (err: any) => console.error("Error al cargar áreas:", err)
    });
  }

  cargarResidentes() {
    this.apiService.getResidentes().subscribe({
      next: (res: any) => this.residentes = res,
      error: (err: any) => console.error("Error al cargar residentes:", err)
    });
  }

  onResidenteSeleccionado(nombre: string) {
    const residente = this.residentes.find(
      (r: any) => `${r.nombre} ${r.apellido}` === nombre
    );
    if (residente?.telefono) {
      this.nuevaCasa.telefono = residente.telefono;
    }
  }

  // --- LÓGICA DE GUARDAR / ACTUALIZAR ---
  guardarCasa() {
    if (!this.nuevaCasa.numero_casa || !this.nuevaCasa.id_area) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'El número de casa y el área son necesarios.',
        confirmButtonColor: '#c5a059'
      });
      return;
    }
    if (!this.nuevaCasa.propietario.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'El nombre del propietario es obligatorio.',
        confirmButtonColor: '#c5a059'
      });
      return;
    }
    if (!this.nuevaCasa.telefono.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'El teléfono es obligatorio.',
        confirmButtonColor: '#c5a059'
      });
      return;
    }

    if (this.editando) {
      // Actualizar registro existente
      this.apiService.updateCasa(this.idSeleccionado, this.nuevaCasa).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Los datos se modificaron correctamente.', 'success');
          this.cancelarEdicion();
          this.cargarCasas();
        },
        error: (err: any) => Swal.fire('Error', 'No se pudo actualizar la información.', 'error')
      });
    } else {
      // Guardar nuevo registro
      this.apiService.saveCasa(this.nuevaCasa).subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: '¡Registrada!',
            text: 'La casa se guardó correctamente.',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarCasas(); 
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire('Error', 'No se pudo guardar en la base de datos.', 'error');
        }
      });
    }
  }

  // --- ACCIONES DE LA TABLA ---
  
  // Carga los datos en el formulario superior
  prepararEditar(casa: any) {
    this.editando = true;
    this.idSeleccionado = casa.id_casa;
    this.nuevaCasa = {
      numero_casa: casa.numero_casa,
      id_area: casa.id_area,
      propietario: casa.propietario,
      telefono: casa.telefono,
      estado: casa.estado
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cambia entre ocupada y desocupada sin borrar el registro
  toggleEstado(casa: any) {
    const nuevoEstado = casa.estado === 'ocupada' ? 'desocupada' : 'ocupada';
    // Creamos una copia del objeto con el nuevo estado
    const datosActualizados = {
      numero_casa: casa.numero_casa,
      id_area: casa.id_area,
      propietario: casa.propietario,
      telefono: casa.telefono,
      estado: nuevoEstado
    };

    this.apiService.updateCasa(casa.id_casa, datosActualizados).subscribe({
      next: () => {
        this.cargarCasas();
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
        Toast.fire({
          icon: 'info',
          title: `Casa marcada como ${nuevoEstado}`
        });
      },
      error: (err: any) => console.error("Error al cambiar estado:", err)
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.idSeleccionado = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevaCasa = {
      numero_casa: '',
      id_area: '',
      propietario: '',
      telefono: '',
      estado: 'ocupada'
    };
  }

  get casasFiltradas() {
    if (!this.searchText) return this.casas;
    const search = this.searchText.toLowerCase();
    return this.casas.filter(casa => 
      casa.numero_casa?.toLowerCase().includes(search) ||
      casa.propietario?.toLowerCase().includes(search) ||
      casa.nombre_area?.toLowerCase().includes(search)
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
      this.router.navigate(['/login']);
    }
  }

  exportarCasasExcel() {
  const data = this.casasFiltradas.map((casa: any) => ({
    'Número de Casa': casa.numero_casa,
    'Área': casa.nombre_area,
    'Propietario': casa.propietario,
    'Teléfono': casa.telefono,
    'Estado': casa.estado
  }));

  this.exportService.exportToExcel(data, 'reporte_casas', 'Casas');
}
exportarCasasPdf() {
  const headers = ['Número de Casa', 'Área', 'Propietario', 'Teléfono', 'Estado'];

  const rows = this.casasFiltradas.map((casa: any) => [
    casa.numero_casa,
    casa.nombre_area || '',
    casa.propietario || '',
    casa.telefono || '',
    casa.estado || ''
  ]);

  this.exportService.exportToPdf(
    'Reporte de Casas',
    headers,
    rows,
    'reporte_casas'
  );
}
 verHistorialPagos(casa: any) {
  this.apiService.getPagos().subscribe({
    next: (pagos: any[]) => {
      const pagosCasa = pagos
        .filter((p: any) => String(p.numero_casa) === String(casa.numero_casa))
        .sort((a: any, b: any) => {
          const fechaA = new Date(a.fecha_pago || 0).getTime();
          const fechaB = new Date(b.fecha_pago || 0).getTime();
          return fechaB - fechaA;
        });

      if (pagosCasa.length === 0) {
        Swal.fire({
          icon: 'info',
          title: `Casa ${casa.numero_casa}`,
          text: 'Esta casa aún no tiene pagos registrados',
          confirmButtonColor: '#3085d6'
        });
        return;
      }

      const totalPagado = pagosCasa.reduce(
        (total: number, pago: any) => total + Number(pago.monto || 0),
        0
      );

      const formatearFecha = (fecha: string) => {
        if (!fecha) return '';
        return new Date(fecha).toLocaleDateString('es-HN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      };

      const getEstadoBadge = (estado: string) => {
        const valor = (estado || '').toLowerCase();

        if (valor === 'pagado') {
          return `<span style="
            background:#dcfce7;
            color:#166534;
            padding:4px 10px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
          ">Pagado</span>`;
        }

        if (valor === 'pendiente') {
          return `<span style="
            background:#fef3c7;
            color:#92400e;
            padding:4px 10px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
          ">Pendiente</span>`;
        }

        if (valor === 'vencido') {
          return `<span style="
            background:#fee2e2;
            color:#991b1b;
            padding:4px 10px;
            border-radius:999px;
            font-size:12px;
            font-weight:600;
          ">Vencido</span>`;
        }

        return `<span style="
          background:#e5e7eb;
          color:#374151;
          padding:4px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:600;
        ">${estado || 'Sin estado'}</span>`;
      };

      let filas = '';

      pagosCasa.forEach((p: any) => {
        filas += `
          <tr>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              ${p.nombre_servicio || 'Sin nombre'}
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee; font-weight:600;">
              L ${Number(p.monto || 0).toFixed(2)}
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              ${formatearFecha(p.fecha_pago)}
            </td>
            <td style="padding:10px; border-bottom:1px solid #eee;">
              ${getEstadoBadge(p.estado)}
            </td>
          </tr>
        `;
      });

      const html = `
        <div style="text-align:left; font-family:Arial, sans-serif;">
          <div style="
            background:#f8fafc;
            border:1px solid #e5e7eb;
            border-radius:12px;
            padding:14px;
            margin-bottom:16px;
          ">
            <div style="font-size:16px; font-weight:700; margin-bottom:8px;">
              Información de la casa
            </div>
            <div style="margin-bottom:4px;"><strong>Número:</strong> ${casa.numero_casa}</div>
            <div style="margin-bottom:4px;"><strong>Propietario:</strong> ${casa.propietario}</div>
            <div style="margin-bottom:4px;"><strong>Teléfono:</strong> ${casa.telefono}</div>
            <div style="margin-bottom:4px;"><strong>Pagos registrados:</strong> ${pagosCasa.length}</div>
            <div><strong>Total pagado:</strong> L ${totalPagado.toFixed(2)}</div>
          </div>

          <div style="
            border:1px solid #e5e7eb;
            border-radius:12px;
            overflow:hidden;
          ">
            <div style="
              background:#1f2937;
              color:white;
              padding:12px 14px;
              font-size:15px;
              font-weight:700;
            ">
              Historial de pagos
            </div>

            <div style="max-height:320px; overflow-y:auto; background:white;">
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <thead style="background:#f9fafb; position:sticky; top:0;">
                  <tr>
                    <th style="text-align:left; padding:10px; border-bottom:1px solid #ddd;">Servicio</th>
                    <th style="text-align:left; padding:10px; border-bottom:1px solid #ddd;">Monto</th>
                    <th style="text-align:left; padding:10px; border-bottom:1px solid #ddd;">Fecha</th>
                    <th style="text-align:left; padding:10px; border-bottom:1px solid #ddd;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${filas}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      Swal.fire({
        title: `Pagos - Casa ${casa.numero_casa}`,
        html,
        width: 850,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#2563eb'
      });
    },
    error: (err) => {
      console.error('Error al obtener pagos:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pagos'
      });
    }
  });
}
}