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

  // --- VARIABLES DE ESTADO ---
  public isRegistering: boolean = false; // Controla el switch entre Login y Registro
  public showPassword = false; 
  public isDarkMode = true; 

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
      
      // Recuperar preferencia de tema
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : true;
      this.applyTheme();
    }
  }

  // --- INTERFAZ Y TEMA ---
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

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      // Colores de fondo para el body (Oscuro Profundo vs Crema Suave)
      const darkColor = '#0a100a'; 
      const lightColor = '#f4f1ec'; 
      const targetColor = this.isDarkMode ? darkColor : lightColor;

      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark-mode');
      } else {
        this.renderer.removeClass(document.body, 'dark-mode');
      }
      
      this.renderer.setStyle(document.documentElement, 'background-color', targetColor);
      this.renderer.setStyle(document.body, 'background-color', targetColor);
    }
  }

  // --- LÓGICA DE LOGIN ---
  ejecutarLogin() {
    if (!this.loginData.usuario || !this.loginData.password) {
      this.mostrarMensaje('warning', 'Atención', 'Por favor, ingresa tus credenciales.');
      return;
    }

    this.apiService.login(this.loginData).subscribe({
      next: (res: any) => {
        if (res.auth) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('usuarioLogueado', JSON.stringify(res.user));
          }
          this.mostrarMensaje('success', `¡Bienvenido, ${res.user.nombre}!`, 'Accediendo al sistema...');
          setTimeout(() => this.router.navigate(['/casas']), 1500);
        } else {
          this.mostrarMensaje('error', 'Fallo de Autenticación', res.message || 'Usuario o contraseña incorrectos.');
        }
      },
      error: () => this.mostrarMensaje('error', 'Error de Conexión', 'No se pudo contactar con el servidor.')
    });
  }

  // --- LÓGICA DE REGISTRO ---
  ejecutarRegistro() {
    if (!this.registerData.nombre || !this.registerData.usuario || !this.registerData.password) {
      this.mostrarMensaje('warning', 'Campos requeridos', 'Completa el nombre, usuario y contraseña.');
      return;
    }

    const rolAsignado = this.registerData.adminCode === 'ANGEL2026' ? 'ADMIN' : 'RESIDENTE';
    const nuevoUsuario = { ...this.registerData, rol: rolAsignado };

    this.apiService.saveUsuario(nuevoUsuario).subscribe({
      next: () => {
        this.mostrarMensaje('success', '¡Registro Exitoso!', 'Tu cuenta ha sido creada. Ahora inicia sesión.');
        this.isRegistering = false; // Regresa al login automáticamente
        this.limpiarFormularios();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.mostrarMensaje('error', 'Error en el Registro', 'El usuario ya existe o los datos son incorrectos.');
      }
    });
  }

  private limpiarFormularios() {
    this.registerData = { nombre: '', usuario: '', password: '', adminCode: '' };
    this.loginData = { usuario: '', password: '' };
  }

  private mostrarMensaje(icon: any, title: string, text: string) {
    if (isPlatformBrowser(this.platformId)) {
      Swal.fire({
        icon, 
        title, 
        text,
        // Colores de SweetAlert adaptados al Modo Oscuro Premium
        background: this.isDarkMode ? '#1a1a1a' : '#ffffff',
        color: this.isDarkMode ? '#ffffff' : '#222222',
        confirmButtonColor: '#c5a059', // Dorado para resaltar
        timer: 2500,
        timerProgressBar: true
      });
    }
  }

  olvidePassword() {
    this.mostrarMensaje('info', 'Gestión de Cuentas', 'Comunícate con la administración para resetear tu clave.');
  }
}