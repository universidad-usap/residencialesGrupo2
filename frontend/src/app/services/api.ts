import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  API_URI = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  // ==========================================
  //                USUARIOS / LOGIN
  // ==========================================
  
  login(loginData: any): Observable<any> {
    return this.http.post(`${this.API_URI}/login`, loginData);
  }

  // Nuevo método para crear usuarios desde el sistema
  saveUsuario(usuarioData: any): Observable<any> {
    return this.http.post(`${this.API_URI}/login/save`, usuarioData);
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

  deleteArea(id: any): Observable<any> {
    return this.http.delete(`${this.API_URI}/areas/${id}`);
  }

  updateArea(id: any, area: any): Observable<any> {
    return this.http.put(`${this.API_URI}/areas/${id}`, area);
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
}