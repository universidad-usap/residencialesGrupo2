import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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
    }
  }

  cargarCasas() {
    this.apiService.getCasas().subscribe({
      next: (res: any) => this.casas = res,
      error: (err: any) => console.error("Error al cargar casas:", err)
    });
  }

  cargarAreas() {
    this.apiService.getAreas().subscribe({
      next: (res: any) => this.areas = res,
      error: (err: any) => console.error("Error al cargar áreas:", err)
    });
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
}