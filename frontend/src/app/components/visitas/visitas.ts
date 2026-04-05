import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-visitas',
  standalone: true,
  imports: [CommonModule, FormsModule, QRCodeComponent],
  templateUrl: './visitas.html',
  styleUrl: './visitas.css',
})
export class VisitasComponent implements OnInit {
  public visitas: any[] = [];
  public tiposVisita: any[] = [];
  public searchText: string = '';
  public user: any = null;

  // QR modal
  public qrVisible: boolean = false;
  public qrToken: string = '';
  public qrVisitaNombre: string = '';

  public nuevaVisita = {
    nombre: '',
    identidad: '',
    telefono: '',
    placa_vehiculo: '',
    id_tipo: '',
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
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
      this.cargarVisitas();
      this.cargarTipos();
    }
  }

  cargarVisitas() {
    this.apiService.getVisitas().subscribe({
      next: (res: any) => (this.visitas = res),
      error: (err: any) => console.error('Error al cargar visitas:', err),
    });
  }

  cargarTipos() {
    this.apiService.getTiposVisita().subscribe({
      next: (res: any) => (this.tiposVisita = res),
      error: (err: any) => console.error('Error al cargar tipos de visita:', err),
    });
  }

  get visitasFiltradas(): any[] {
    if (!this.searchText.trim()) return this.visitas;
    const term = this.searchText.toLowerCase();
    return this.visitas.filter(
      (v) =>
        v.nombre?.toLowerCase().includes(term) ||
        v.identidad?.toLowerCase().includes(term) ||
        v.placa_vehiculo?.toLowerCase().includes(term),
    );
  }

  registrarVisita() {
    if (!this.nuevaVisita.nombre.trim() || !this.nuevaVisita.identidad.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos obligatorios', text: 'El nombre e identidad son requeridos.' });
      return;
    }

    this.apiService.saveVisita(this.nuevaVisita).subscribe({
      next: (res: any) => {
        this.qrToken = res.codigo_token;
        this.qrVisitaNombre = this.nuevaVisita.nombre;
        this.qrVisible = true;
        this.resetForm();
        this.cargarVisitas();
      },
      error: (err: any) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err.error?.error || 'No se pudo registrar la visita.' });
      },
    });
  }

  mostrarQR(visita: any) {
    if (!visita.codigo_token) {
      Swal.fire({ icon: 'info', title: 'Sin QR', text: 'Esta visita no tiene un QR generado.' });
      return;
    }
    this.qrToken = visita.codigo_token;
    this.qrVisitaNombre = visita.nombre;
    this.qrVisible = true;
  }

  regenerarQR(visita: any) {
    Swal.fire({
      title: '¿Regenerar QR?',
      text: 'El QR anterior quedará inválido.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, regenerar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.regenerarQR(visita.id_visita).subscribe({
          next: (res: any) => {
            this.qrToken = res.codigo_token;
            this.qrVisitaNombre = visita.nombre;
            this.qrVisible = true;
            this.cargarVisitas();
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo regenerar el QR.' }),
        });
      }
    });
  }

  eliminarVisita(id: any) {
    Swal.fire({
      title: '¿Eliminar visita?',
      text: 'Se eliminará la visita y su código QR.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteVisita(id).subscribe({
          next: () => {
            Swal.fire({ icon: 'success', title: 'Eliminada', timer: 1500, showConfirmButton: false });
            this.cargarVisitas();
          },
          error: () => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la visita.' }),
        });
      }
    });
  }

  cerrarQR() {
    this.qrVisible = false;
    this.qrToken = '';
  }

  imprimirQR() {
    const printContent = document.getElementById('qr-print-area');
    if (!printContent) return;
    const w = window.open('', '_blank', 'width=400,height=500');
    if (!w) return;
    w.document.write(`
      <html><head><title>QR - ${this.qrVisitaNombre}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:20px;}h3{margin-bottom:8px;}p{color:#555;}</style>
      </head><body>
      <h3>Pase de Acceso</h3>
      <p>${this.qrVisitaNombre}</p>
      ${printContent.innerHTML}
      </body></html>`);
    w.document.close();
    w.print();
  }

  resetForm() {
    this.nuevaVisita = { nombre: '', identidad: '', telefono: '', placa_vehiculo: '', id_tipo: '' };
  }

  getEstadoBadge(estado: string): string {
    switch (estado) {
      case 'activo': return 'badge bg-success';
      case 'usado': return 'badge bg-secondary';
      case 'expirado': return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }
}
