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
  isDarkMode = true; // Por defecto iniciamos en oscuro para un look moderno

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private renderer: Renderer2, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
      
      const savedTheme = localStorage.getItem('theme');
      // Si existe un tema guardado lo usamos, si no, mantenemos el true por defecto
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      
      this.applyTheme();
    }
  }

  // Controla el ojo de la contraseña
  togglePassword() {
  this.showPassword = !this.showPassword;
  console.log('Visibilidad:', this.showPassword); 
}

  // Controla el interruptor de Sol/Luna
  toggleTheme() {
  this.isDarkMode = !this.isDarkMode;
  if (isPlatformBrowser(this.platformId)) {
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const darkColor = '#0d1117'; // Fondo oscuro premium
      const lightColor = '#f0f2f5'; // Fondo claro bootstrap
      
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
        <div style="text-align: left; padding: 10px;">
          <label style="font-size: 0.75rem; font-weight: bold; color: #888;">NOMBRE COMPLETO</label>
          <input id="swal-input1" class="swal2-input" style="width: 100%; margin: 5px 0 15px 0;" placeholder="Ej. Juan Pérez">
          <label style="font-size: 0.75rem; font-weight: bold; color: #888;">USUARIO</label>
          <input id="swal-input2" class="swal2-input" style="width: 100%; margin: 5px 0 15px 0;" placeholder="Ej. juan123">
          <label style="font-size: 0.75rem; font-weight: bold; color: #888;">CONTRASEÑA</label>
          <input id="swal-input3" type="password" class="swal2-input" style="width: 100%; margin: 5px 0 5px 0;" placeholder="********">
        </div>
      `,
      focusConfirm: false,
      background: this.isDarkMode ? '#161b22' : '#fff',
      color: this.isDarkMode ? '#f0f6fc' : '#2d3436',
      confirmButtonText: 'Registrar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00e676',
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
    }).then((result: any) => { // Agregado :any para evitar error de compilación
      if (result.isConfirmed) {
        this.apiService.saveUsuario(result.value).subscribe({
          next: () => this.mostrarMensaje('success', 'Éxito', 'Usuario creado correctamente. Ya puedes iniciar sesión.'),
          error: () => this.mostrarMensaje('error', 'Error', 'No se pudo crear el usuario o ya existe.')
        });
      }
    });
  }

  olvidePassword() {
    this.mostrarMensaje('info', 'Recuperación', 'Por favor, contacta al Administrador del Residencial para restablecer tu clave.');
  }
}