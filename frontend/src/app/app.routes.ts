import { Routes } from '@angular/router';

import { LoginComponent } from './components/login/login';
import { AreasComponent } from './components/areas/areas';
import { CasasComponent } from './components/casas/casas';
import { Residentes } from './components/residentes/residentes';
import { ServiciosComponent } from './components/servicios/servicios';
import { ComunicadosComponent } from './components/comunicados/comunicados';
import { VisitasComponent } from './components/visitas/visitas';
import { ValidacionComponent } from './components/validacion/validacion';
import { UsuariosComponent } from './components/usuarios/usuarios';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'areas', component: AreasComponent },
  { path: 'casas', component: CasasComponent },
  { path: 'residentes', component: Residentes },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'comunicados', component: ComunicadosComponent },
  { path: 'visitas', component: VisitasComponent },
  { path: 'validacion', component: ValidacionComponent },
  { path: 'usuarios', component: UsuariosComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];