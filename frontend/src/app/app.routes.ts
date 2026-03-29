import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { AreasComponent } from './components/areas/areas';
import { CasasComponent } from './components/casas/casas';
import { ServiciosComponent } from './components/servicios/servicios';
import { ComunicadosComponent } from './components/comunicados/comunicados';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'areas', component: AreasComponent },
  { path: 'casas', component: CasasComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'comunicados', component: ComunicadosComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];