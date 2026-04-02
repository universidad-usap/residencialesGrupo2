import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.html',
  styleUrls: ['./servicios.css']
})
export class ServiciosComponent implements OnInit {
  tabActual: string = 'pagos';
  servicios: any[] = [];
  pagos: any[] = [];
  casas: any[] = [];

  nuevoServicio = {
    nombre: '',
    descripcion: '',
    costo: 0
  };

  nuevoPago = {
    id_casa: '',
    id_servicio: '',
    monto: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarServicios();
    this.cargarPagos();
    this.cargarCasas();
  }

  cambiarTab(tab: string) {
    this.tabActual = tab;
  }

  // ==========================================
  //         LÓGICA DEL CATÁLOGO
  // ==========================================

  cargarServicios() {
    this.apiService.getCatalog().subscribe(
      (res: any) => this.servicios = res,
      (err: any) => console.error(err)
    );
  }

  guardarServicio() {
    if (!this.nuevoServicio.nombre || this.nuevoServicio.costo <= 0) {
      Swal.fire('Error', 'Complete el nombre y costo del servicio', 'error');
      return;
    }

    this.apiService.saveCatalog(this.nuevoServicio).subscribe(
      (res: any) => {
        Swal.fire('Éxito', 'Servicio agregado al catálogo', 'success');
        this.nuevoServicio = { nombre: '', descripcion: '', costo: 0 };
        this.cargarServicios();
      },
      (err: any) => Swal.fire('Error', 'No se pudo guardar el servicio', 'error')
    );
  }

  editarServicio(servicio: any) {
    Swal.fire({
      title: 'Editar Servicio',
      background: '#f4f1ea',
      html: `
        <div class="text-start">
          <label class="form-label small fw-bold">Nombre</label>
          <input id="swal-nombre" class="form-control mb-3" value="${servicio.nombre}">
          <label class="form-label small fw-bold">Descripción</label>
          <input id="swal-desc" class="form-control mb-3" value="${servicio.descripcion}">
          <label class="form-label small fw-bold">Costo Base</label>
          <input id="swal-costo" type="number" class="form-control" value="${servicio.costo}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0d6efd',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const descripcion = (document.getElementById('swal-desc') as HTMLInputElement).value;
        const costo = (document.getElementById('swal-costo') as HTMLInputElement).value;
        
        if (!nombre || !costo) {
          Swal.showValidationMessage('Nombre y costo son obligatorios');
        }
        return { nombre, descripcion, costo };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.updateServicio(servicio.id_servicio, result.value).subscribe(
          res => {
            Swal.fire('Actualizado', 'El servicio ha sido modificado', 'success');
            this.cargarServicios();
          },
          err => Swal.fire('Error', 'No se pudo actualizar el servicio', 'error')
        );
      }
    });
  }

  toggleEstadoServicio(servicio: any) {
    const nuevoEstado = servicio.estado === 'Activo' ? 'Inactivo' : 'Activo';
    
    this.apiService.updateEstadoServicio(servicio.id_servicio, nuevoEstado).subscribe(
      res => {
        Swal.fire({
          title: `Servicio ${nuevoEstado}`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
        this.cargarServicios();
      },
      err => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    );
  }

  // ==========================================
  //         LÓGICA DE PAGOS
  // ==========================================

  cargarPagos() {
    this.apiService.getPagos().subscribe(
      (res: any) => this.pagos = res,
      (err: any) => console.error(err)
    );
  }

  cargarCasas() {
    this.apiService.getCasas().subscribe(
      (res: any) => this.casas = res,
      (err: any) => console.error(err)
    );
  }

  registrarPago() {
    if (!this.nuevoPago.id_casa || !this.nuevoPago.id_servicio || this.nuevoPago.monto <= 0) {
      Swal.fire('Error', 'Seleccione casa, servicio y monto válido', 'error');
      return;
    }

    this.apiService.savePago(this.nuevoPago).subscribe(
      (res: any) => {
        Swal.fire('Éxito', 'Pago registrado correctamente', 'success');
        this.nuevoPago = { id_casa: '', id_servicio: '', monto: 0 };
        this.cargarPagos();
      },
      (err: any) => Swal.fire('Error', 'Error al registrar el pago', 'error')
    );
  }

  updateEstadoPago(id: any, nuevoEstado: string) {
    this.apiService.updateEstadoPago(id, nuevoEstado).subscribe(
      (res: any) => {
        Swal.fire('Actualizado', `El pago ha sido marcado como ${nuevoEstado}`, 'success');
        this.cargarPagos();
      },
      (err: any) => Swal.fire('Error', 'No se pudo actualizar el pago', 'error')
    );
  }

  getBadgeClass(estado: string) {
    if (!estado) return 'bg-secondary';
    switch (estado.toLowerCase()) {
      case 'pagado': return 'bg-success';
      case 'pendiente': return 'bg-warning text-dark';
      case 'vencido': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}