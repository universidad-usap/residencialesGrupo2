import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  public isDarkMode: boolean = false;
  private themeSub!: Subscription;

  isCollapsed: boolean = false;
  expandedSections: Set<string> = new Set(['mantenimientos', 'informacion', 'accesos']);

  @HostBinding('class.sidebar-collapsed')
  get collapsedClass() { return this.isCollapsed; }

  @HostBinding('class.sidebar-visible')
  get visibleClass() { return this.showNavbar(); }

  constructor(
    private router: Router,
    private themeService: ThemeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.themeSub = this.themeService.isDarkMode$.subscribe((mode: boolean) => {
      this.isDarkMode = mode;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  showNavbar(): boolean {
    return this.router.url !== '/login';
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSection(section: string): void {
    if (this.expandedSections.has(section)) {
      this.expandedSections.delete(section);
    } else {
      this.expandedSections.add(section);
    }
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections.has(section);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuarioLogueado');
    }
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    if (this.themeSub) {
      this.themeSub.unsubscribe();
    }
  }
}