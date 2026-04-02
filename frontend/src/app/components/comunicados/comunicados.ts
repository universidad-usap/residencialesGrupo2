import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comunicados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicados.html',
  styleUrl: './comunicados.css'
})
export class ComunicadosComponent implements OnInit {
  // Inicializamos siempre como un arreglo vacío para evitar errores de iteración
  public comunicados: any[] = [];
  
  public nuevoComunicado = {
    titulo: '',
    mensaje: '',
    prioridad: 'informativo'
  };

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarComunicados();
    }
  }

  cargarComunicados() {
    this.apiService.getComunicados().subscribe({
      next: (res: any) => {
        // Validación crítica: Solo asignamos si la respuesta es un arreglo
        // Esto previene el error NG02200 si el servidor envía un objeto por error
        if (Array.isArray(res)) {
          this.comunicados = res;
        } else {
          console.error('La respuesta del servidor no es un arreglo:', res);
          this.comunicados = [];
        }
      },
      error: (err: any) => {
        console.error('Error al cargar comunicados:', err);
        this.comunicados = [];
      }
    });
  }

  publicar() {
    // Validamos que los campos no estén vacíos antes de enviar
    if (!this.nuevoComunicado.titulo.trim() || !this.nuevoComunicado.mensaje.trim()) {
      Swal.fire('Atención', 'Por favor completa el título y el mensaje', 'warning');
      return;
    }

    this.apiService.saveComunicado(this.nuevoComunicado).subscribe({
      next: (res: any) => {
        // Mostramos mensaje de éxito basado en la respuesta del backend
        Swal.fire('¡Publicado!', 'El comunicado se guardó correctamente', 'success');
        
        // Limpiamos el formulario para una nueva entrada
        this.nuevoComunicado = { 
          titulo: '', 
          mensaje: '', 
          prioridad: 'informativo' 
        };
        
        // Recargamos la lista desde el servidor para obtener los datos actualizados
        this.cargarComunicados(); 
      },
      error: (err) => {
        console.error('Error al publicar:', err);
        Swal.fire('Error', 'No se pudo publicar el comunicado', 'error');
      }
    });
  }
}