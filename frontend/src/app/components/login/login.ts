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
  public showPassword = false;
  public isDarkMode = false;

  loginData = { usuario: '', password: '' };

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
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
      this.applyTheme();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
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
      this.mostrarMensaje('warning', 'Atenci\u00f3n', 'Por favor complete todos los campos.');
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

  private mostrarMensaje(icon: any, title: string, text: string) {
    if (isPlatformBrowser(this.platformId)) {
      Swal.fire({
        icon,
        title,
        text,
        background: this.isDarkMode ? '#1a1d1a' : '#ffffff',
        color: this.isDarkMode ? '#ffffff' : '#1b1b1b',
        confirmButtonColor: '#c5a059'
      });
    }
  }
}
