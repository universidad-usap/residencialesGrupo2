import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL base del backend
  API_URI = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  // ==========================================
  //                USUARIOS / LOGIN
  // ==========================================
  login(loginData: any): Observable<any> {
    return this.http.post(`${this.API_URI}/login`, loginData);
  }

  saveUsuario(usuarioData: any): Observable<any> {
    return this.http.post(`${this.API_URI}/login/save`, usuarioData);
  }

  getUsuarios(): Observable<any> {
    return this.http.get(`${this.API_URI}/login/list`);
  }

  deleteUsuario(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/login/${id}`);
  }

  // ==========================================
  //                ÁREAS
  // ==========================================
  getAreas(): Observable<any> {
    return this.http.get(`${this.API_URI}/areas`);
  }

  saveArea(area: any): Observable<any> {
    return this.http.post(`${this.API_URI}/areas`, area);
  }

  updateArea(id: any, area: any): Observable<any> {
    return this.http.put(`${this.API_URI}/areas/${id}`, area);
  }

  deleteArea(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/areas/${id}`);
  }

  // ==========================================
  //                CASAS
  // ==========================================
  getCasas(): Observable<any> {
    return this.http.get(`${this.API_URI}/casas`);
  }

  saveCasa(casa: any): Observable<any> {
    return this.http.post(`${this.API_URI}/casas`, casa);
  }

  updateCasa(id: any, casa: any): Observable<any> {
    return this.http.put(`${this.API_URI}/casas/${id}`, casa);
  }

  deleteCasa(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/casas/${id}`);
  }

  // ==========================================
  //                RESIDENTES
  // ==========================================
  getResidentes(): Observable<any> {
    return this.http.get(`${this.API_URI}/residentes`);
  }

  saveResidente(residente: any): Observable<any> {
    return this.http.post(`${this.API_URI}/residentes`, residente);
  }

  updateResidente(id: any, residente: any): Observable<any> {
    return this.http.put(`${this.API_URI}/residentes/${id}`, residente);
  }

  deleteResidente(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/residentes/${id}`);
  }

  // ==========================================
  //                COMUNICADOS
  // ==========================================
  getComunicados(): Observable<any> {
    return this.http.get(`${this.API_URI}/comunicados`);
  }

  saveComunicado(comunicado: any): Observable<any> {
    return this.http.post(`${this.API_URI}/comunicados`, comunicado);
  }

  deleteComunicado(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/comunicados/${id}`);
  }

  // ==========================================
  //         SERVICIOS Y PAGOS (CORREGIDO)
  // ==========================================

  /** CATÁLOGO DE SERVICIOS */
  getCatalog(): Observable<any> {
    return this.http.get(`${this.API_URI}/servicios/catalogo`);
  }

  saveCatalog(servicio: any): Observable<any> {
    return this.http.post(`${this.API_URI}/servicios/catalogo`, servicio);
  }

  // Editar datos del servicio
  updateServicio(id: any, servicio: any): Observable<any> {
    return this.http.put(`${this.API_URI}/servicios/catalogo/${id}`, servicio);
  }

  /** CONTROL DE PAGOS */
  getPagos(): Observable<any> {
    return this.http.get(`${this.API_URI}/servicios/pagos`);
  }

  savePago(pago: any): Observable<any> {
    return this.http.post(`${this.API_URI}/servicios/pagos`, pago);
  }

  updateEstadoPago(id: any, estado: any): Observable<any> {
    return this.http.put(`${this.API_URI}/servicios/pagos/${id}`, { estado });
  }
  getPagosPorCasa(id: number): Observable<any> {
    return this.http.get(`${this.API_URI}/pagos/casa/${id}`);
  }

  // ==========================================
  //                VISITAS / QR
  // ==========================================
  getVisitas(): Observable<any> {
    return this.http.get(`${this.API_URI}/visitas`);
  }

  getTiposVisita(): Observable<any> {
    return this.http.get(`${this.API_URI}/visitas/tipos`);
  }

  saveVisita(visita: any): Observable<any> {
    return this.http.post(`${this.API_URI}/visitas`, visita);
  }

  deleteVisita(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/visitas/${id}`);
  }

  regenerarQR(id_visita: any): Observable<any> {
    return this.http.put(`${this.API_URI}/visitas/${id_visita}/regenerar-qr`, {});
  }

  // ==========================================
  //                ACCESOS
  // ==========================================
  validarQR(data: { codigo_token: string; guardia_id?: number }): Observable<any> {
    return this.http.post(`${this.API_URI}/accesos/validar`, data);
  }

  getAccesos(): Observable<any> {
    return this.http.get(`${this.API_URI}/accesos`);
  }
}