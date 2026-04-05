import { Component, OnInit, Inject, PLATFORM_ID, Renderer2, ChangeDetectorRef } from '@angular/core';
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
  // Estados de la interfaz
  public isRegistering: boolean = false;
  public showPassword = false;
  public isDarkMode = false; // Cambiado a false por defecto para priorizar legibilidad inicial

  // Modelos de datos
  loginData = { usuario: '', password: '' };
  registerData = { nombre: '', usuario: '', password: '', adminCode: '' };

  constructor(
    private apiService: ApiService,
    private router: Router,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
      
      // Recuperar tema guardado o usar claro por defecto
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark'; 
      
      this.applyTheme();
    }
  }

  // Cambiar entre modo claro y oscuro
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  // Mostrar/Ocultar contraseña (Resuelve error TS2339)
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      // Colores de fondo para el body según el modo
      const color = this.isDarkMode ? '#0a0f0a' : '#f4f1ec';
      
      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
      }
      
      this.renderer.setStyle(document.body, 'background-color', color);
    }
  }

  ejecutarLogin() {
    if (!this.loginData.usuario || !this.loginData.password) {
      this.mostrarMensaje('warning', 'Atención', 'Por favor complete todos los campos.');
      return;
    }

    this.apiService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.auth) {
          localStorage.setItem('usuarioLogueado', JSON.stringify(res.user));
          this.router.navigate(['/casas']);
        } else {
          this.mostrarMensaje('error', 'Error de acceso', res.message || 'Credenciales incorrectas');
        }
      },
      error: () => this.mostrarMensaje('error', 'Error', 'No se pudo conectar con el servidor')
    });
  }

  ejecutarRegistro() {
    // Validación básica antes de enviar
    if (!this.registerData.nombre || !this.registerData.usuario || !this.registerData.password || !this.registerData.adminCode) {
      this.mostrarMensaje('warning', 'Atención', 'Todos los campos son obligatorios, incluyendo el código de autorización.');
      return;
    }

    const rol = this.registerData.adminCode === 'ANGEL2026' ? 'ADMIN' : 'RESIDENTE';
    
    this.apiService.saveUsuario({ ...this.registerData}).subscribe({
      next: () => {
        this.mostrarMensaje('success', '¡Registro Exitoso!', 'Su cuenta ha sido creada. Ya puede iniciar sesión.');
        
        // Reset de formulario y cambio a pestaña de login
        this.isRegistering = false; 
        this.registerData = { nombre: '', usuario: '', password: '', adminCode: '' };
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.mostrarMensaje('error', 'Error de Registro', 'El nombre de usuario ya existe o los datos son inválidos.');
      }
    });
  }

  private mostrarMensaje(icon: any, title: string, text: string) {
    if (isPlatformBrowser(this.platformId)) {
      Swal.fire({
        icon,
        title,
        text,
        // Adaptar colores de SweetAlert al modo actual
        background: this.isDarkMode ? '#1a1d1a' : '#ffffff',
        color: this.isDarkMode ? '#ffffff' : '#1b1b1b',
        confirmButtonColor: '#c5a059'
      });
    }
  }
}