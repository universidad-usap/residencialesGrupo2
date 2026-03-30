import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme'; 

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
export class NavbarComponent implements OnInit, OnDestroy {
  // Variable para controlar el icono (sol/luna) en el HTML
  public isDarkMode: boolean = false;
  private themeSub!: Subscription;

  constructor(
    private router: Router,
    private themeService: ThemeService, // Inyectamos el motor del tema
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Nos suscribimos para que el Navbar sepa si el tema cambia
    this.themeSub = this.themeService.isDarkMode$.subscribe((mode: boolean) => {
      this.isDarkMode = mode;
    });
  }

  // Esta es la función que activa el botón del HTML
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  showNavbar(): boolean {
    return this.router.url !== '/login';
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // Evitamos fugas de memoria al destruir el componente
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }
}