import { Component, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  loginData = {
    usuario: '',
    password: ''
  };

  showPassword = false; 
  isDarkMode = true; 

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private renderer: Renderer2, // Usamos Renderer2 para manipular el DOM de forma segura
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
      
      const savedTheme = localStorage.getItem('theme');
      // Si no hay tema guardado, usamos oscuro por defecto
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      
      this.applyTheme();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  /**
   * Esta función es CRÍTICA para quitar el marco blanco.
   * Aplica el color directamente al body y html.
   */
  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const darkColor = '#0d1117';
      const lightColor = '#f0f2f5';
      
      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
        this.renderer.setStyle(document.documentElement, 'background-color', darkColor);
        this.renderer.setStyle(document.body, 'background-color', darkColor);
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
        this.renderer.setStyle(document.documentElement, 'background-color', lightColor);
        this.renderer.setStyle(document.body, 'background-color', lightColor);
      }
    }
  }

  onLogin() {
    if (!this.loginData.usuario || !this.loginData.password) {
      this.mostrarMensaje('warning', 'Campos vacíos', 'Por favor, completa todos los datos.');
      return;
    }

    this.apiService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.auth) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('usuarioLogueado', JSON.stringify(res.user));
          }
          
          this.mostrarMensaje('success', `¡Bienvenido, ${res.user.nombre}!`, 'Accediendo al panel...');
          
          setTimeout(() => {
            this.router.navigate(['/casas']);
          }, 1500);

        } else {
          this.mostrarMensaje('error', 'Acceso Denegado', res.message || 'Credenciales inválidas');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.mostrarMensaje('error', 'Error de Conexión', 'No se pudo contactar con el servidor.');
      }
    });
  }

  private mostrarMensaje(icon: any, title: string, text: string) {
    if (isPlatformBrowser(this.platformId)) {
      Swal.fire({
        icon: icon,
        title: title,
        text: text,
        background: this.isDarkMode ? '#161b22' : '#fff',
        color: this.isDarkMode ? '#f0f6fc' : '#2d3436',
        confirmButtonColor: '#00e676',
        timer: 2500,
        showConfirmButton: icon === 'error'
      });
    }
  }

  mostrarRegistro() {
    Swal.fire({
      title: 'Crear Usuario Nuevo',
      html: `
        <div style="text-align: left;">
          <label style="font-size: 0.8rem; color: gray;">NOMBRE COMPLETO</label>
          <input id="swal-input1" class="swal2-input" style="margin-top: 5px;">
          <label style="font-size: 0.8rem; color: gray;">USUARIO</label>
          <input id="swal-input2" class="swal2-input" style="margin-top: 5px;">
          <label style="font-size: 0.8rem; color: gray;">CONTRASEÑA</label>
          <input id="swal-input3" type="password" class="swal2-input" style="margin-top: 5px;">
        </div>
      `,
      focusConfirm: false,
      background: this.isDarkMode ? '#161b22' : '#fff',
      color: this.isDarkMode ? '#f0f6fc' : '#2d3436',
      confirmButtonText: 'Registrar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = (document.getElementById('swal-input1') as HTMLInputElement).value;
        const usuario = (document.getElementById('swal-input2') as HTMLInputElement).value;
        const password = (document.getElementById('swal-input3') as HTMLInputElement).value;
        
        if (!nombre || !usuario || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        return { nombre, usuario, password };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.saveUsuario(result.value).subscribe({
          next: () => this.mostrarMensaje('success', 'Éxito', 'Usuario creado correctamente'),
          error: () => this.mostrarMensaje('error', 'Error', 'El usuario ya existe')
        });
      }
    });
  }

  olvidePassword() {
    this.mostrarMensaje('info', 'Recuperación', 'Contacta al administrador para restablecer tu contraseña.');
  }
}