import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-residentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './residentes.html',
  styleUrl: './residentes.css',
})
export class Residentes implements OnInit {
  public residentes: any[] = [];
  public casas: any[] = [];
  public searchText: string = '';
  public isDarkMode: boolean = false;
  public user: any = null;

  public editando: boolean = false;
  public idSeleccionado: any = null;

  public nuevoResidente = {
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    id_casa: '',
    tipo: 'familiar',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private exportService: ExportService,
    @Inject(PLATFORM_ID) private platformId: Object,
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

      this.cargarResidentes();
      this.cargarCasas();
    }
  }

  cargarResidentes() {
    this.apiService.getResidentes().subscribe({
      next: (res: any) => {
        this.residentes = [...res];
        this.cd.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar residentes:', err),
    });
  }

  cargarCasas() {
    this.apiService.getCasas().subscribe({
      next: (res: any) => (this.casas = res),
      error: (err: any) => console.error('Error al cargar casas:', err),
    });
  }

  guardarResidente() {
    if (!this.nuevoResidente.nombre.trim() || !this.nuevoResidente.apellido.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'El nombre y apellido son necesarios.',
        confirmButtonColor: '#c5a059',
      });
      return;
    }

    const datosResidente = {
      ...this.nuevoResidente,
      id_casa: this.nuevoResidente.id_casa ? Number(this.nuevoResidente.id_casa) : '',
    };

    if (this.editando) {
      this.apiService.updateResidente(this.idSeleccionado, datosResidente).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', 'Los datos se modificaron correctamente.', 'success');
          this.cancelarEdicion();
          this.cargarResidentes();
        },
        error: (err: any) => {
          console.error('Error al actualizar:', err);
          const mensaje = err.error?.error || 'No se pudo actualizar la información.';
          Swal.fire('Error', mensaje, 'error');
        },
      });
    } else {
      this.apiService.saveResidente(datosResidente).subscribe({
        next: (res: any) => {
          console.log('Residente guardado:', res);
          Swal.fire({
            icon: 'success',
            title: '¡Registrado!',
            text: 'El residente se guardó correctamente.',
            timer: 2000,
            showConfirmButton: false,
          });
          this.cargarResidentes();
          this.limpiarFormulario();
        },
        error: (err: any) => {
          console.error('Error completo al guardar:', err);
          const mensaje =
            err.error?.error || err.error?.message || 'No se pudo guardar en la base de datos.';
          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: mensaje,
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  prepararEditar(residente: any) {
    this.editando = true;
    this.idSeleccionado = residente.id_residente;
    this.nuevoResidente = {
      nombre: residente.nombre,
      apellido: residente.apellido,
      telefono: residente.telefono,
      email: residente.email,
      id_casa: residente.id_casa,
      tipo: residente.tipo,
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminarResidente(residente: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará a ${residente.nombre} ${residente.apellido}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteResidente(residente.id_residente).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El residente ha sido eliminado.', 'success');
            this.cargarResidentes();
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el residente.', 'error');
          },
        });
      }
    });
  }

  cancelarEdicion() {
    this.editando = false;
    this.idSeleccionado = null;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoResidente = {
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      id_casa: '',
      tipo: 'familiar',
    };
  }

  get residentesFiltrados() {
    if (!this.searchText) return this.residentes;
    const search = this.searchText.toLowerCase();
    return this.residentes.filter(
      (residente) =>
        residente.nombre?.toLowerCase().includes(search) ||
        residente.apellido?.toLowerCase().includes(search) ||
        residente.email?.toLowerCase().includes(search) ||
        residente.numero_casa?.toLowerCase().includes(search) ||
        residente.tipo?.toLowerCase().includes(search),
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
      this.router.navigate(['/login']);
    }
  }

  exportarResidentesExcel() {
    const data = this.residentesFiltrados.map((residente: any) => ({
      Nombre: residente.nombre,
      Apellido: residente.apellido,
      Teléfono: residente.telefono || '',
      Email: residente.email || '',
      'Casa #': residente.numero_casa || '',
      Tipo: residente.tipo,
    }));

    this.exportService.exportToExcel(data, 'reporte_residentes', 'Residentes');
  }

  exportarResidentesPdf() {
    const headers = ['Nombre', 'Apellido', 'Teléfono', 'Email', 'Casa #', 'Tipo'];

    const rows = this.residentesFiltrados.map((residente: any) => [
      residente.nombre || '',
      residente.apellido || '',
      residente.telefono || '',
      residente.email || '',
      residente.numero_casa || '',
      residente.tipo || '',
    ]);

    this.exportService.exportToPdf('Reporte de Residentes', headers, rows, 'reporte_residentes');
  }

  getTipoBadgeClass(tipo: string): string {
    switch (tipo?.toLowerCase()) {
      case 'propietario':
        return 'bg-success';
      case 'familiar':
        return 'bg-info';
      case 'inquilino':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  }
}
