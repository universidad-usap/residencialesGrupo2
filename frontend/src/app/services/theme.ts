import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Estado inicial del tema (false = claro)
  private darkMode = new BehaviorSubject<boolean>(false);
  
  // Observable para que el Navbar y otros componentes se enteren del cambio
  isDarkMode$ = this.darkMode.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Verificamos si hay un tema guardado en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const savedMode = localStorage.getItem('darkMode');
      const isDark = savedMode ? JSON.parse(savedMode) : false;
      this.darkMode.next(isDark);
      this.applyTheme(isDark);
    }
  }

  // Función que llama el botón del Navbar
  toggleTheme() {
    const newMode = !this.darkMode.value;
    this.darkMode.next(newMode);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkMode', JSON.stringify(newMode));
      this.applyTheme(newMode);
    }
  }

  // Esta función añade o quita la clase al body para que el CSS funcione
  private applyTheme(isDark: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      if (isDark) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
    }
  }
}