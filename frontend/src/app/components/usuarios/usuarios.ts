import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class UsuariosComponent implements OnInit {
  public usuarios: any[] = [];
  public isDarkMode: boolean = false;
  public searchText: string = '';

  public nuevoUsuario = {
    nombre: '',
    usuario: '',
    password: '',
    rol: 'GUARDIA',
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
      const user = JSON.parse(session);
      if (user.rol !== 'ADMIN') {
        this.router.navigate(['/casas']);
        return;
      }
      this.isDarkMode = document.body.classList.contains('dark-mode');
      this.cargarUsuarios();
    }
  }

  cargarUsuarios() {
    this.apiService.getUsuarios().subscribe({
      next: (data: any[]) => {
        this.usuarios = data;
      },
      error: () => this.mostrarMensaje('error', 'Error', 'No se pudo cargar la lista de usuarios.'),
    });
  }

  get usuariosFiltrados() {
    if (!this.searchText) return this.usuarios;
    const term = this.searchText.toLowerCase();
    return this.usuarios.filter(
      (u) =>
        u.nombre?.toLowerCase().includes(term) ||
        u.usuario?.toLowerCase().includes(term) ||
        u.rol?.toLowerCase().includes(term),
    );
  }

  guardarUsuario() {
    const { nombre, usuario, password, rol } = this.nuevoUsuario;
    if (!nombre || !usuario || !password || !rol) {
      this.mostrarMensaje('warning', 'Atención', 'Todos los campos son obligatorios.');
      return;
    }
    this.apiService.saveUsuario({ nombre, usuario, password, rol }).subscribe({
      next: () => {
        this.mostrarMensaje('success', 'Éxito', `Usuario "${usuario}" creado correctamente.`);
        this.nuevoUsuario = { nombre: '', usuario: '', password: '', rol: 'GUARDIA' };
        this.cargarUsuarios();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'El usuario ya existe o los datos son inválidos.';
        this.mostrarMensaje('error', 'Error', msg);
      },
    });
  }

  eliminarUsuario(id: any, nombreUsuario: string) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará el usuario "${nombreUsuario}" permanentemente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: this.isDarkMode ? '#1a1d1a' : '#ffffff',
      color: this.isDarkMode ? '#ffffff' : '#1b1b1b',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.deleteUsuario(id).subscribe({
          next: () => {
            this.mostrarMensaje('success', 'Eliminado', 'Usuario eliminado correctamente.');
            this.cargarUsuarios();
          },
          error: () => this.mostrarMensaje('error', 'Error', 'No se pudo eliminar el usuario.'),
        });
      }
    });
  }

  private mostrarMensaje(icon: any, title: string, text: string) {
    Swal.fire({
      icon,
      title,
      text,
      background: this.isDarkMode ? '#1a1d1a' : '#ffffff',
      color: this.isDarkMode ? '#ffffff' : '#1b1b1b',
      confirmButtonColor: '#c5a059',
    });
  }
}
