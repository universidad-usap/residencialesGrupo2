import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common'; // Importar isPlatformBrowser
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatToolbarModule, 
    MatButtonModule, 
    MatMenuModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inyectamos la plataforma
  ) {}

  // Función para decidir si mostrar el menú o no
  showNavbar(): boolean {
    // Si la ruta es '/login', ocultamos el navbar
    // No usamos localStorage aquí para evitar parpadeos en el renderizado
    return this.router.url !== '/login';
  }

  // Función para Cerrar Sesión
  logout() {
    // Verificamos si estamos en el navegador antes de limpiar localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
    }
    
    // Redirigimos al Login
    this.router.navigate(['/login']);
  }
}