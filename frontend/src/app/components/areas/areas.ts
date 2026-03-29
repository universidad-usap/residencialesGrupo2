import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './areas.html',
  styleUrl: './areas.css'
})
export class AreasComponent implements OnInit {
  listAreas: any = [];
  
  // Objeto para los inputs del formulario
  area: any = {
    nombre: '',
    descripcion: ''
  };

  isEditing: boolean = false;
  idAreaSeleccionada: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.obtenerAreas();
  }

  // Trae todos los registros para poder alternar entre Activo/Inactivo
  obtenerAreas() {
  this.apiService.getAreas().subscribe({
    next: (res) => {
      this.listAreas = [...res]; 
    },
    error: (err) => console.error('Error al obtener áreas:', err)
  });
}

  guardarNuevaArea() {
    if (!this.area.nombre.trim()) return alert('El nombre es obligatorio');

    this.apiService.saveArea(this.area).subscribe({
      next: (res) => {
        alert('Área registrada con éxito');
        this.limpiarFormulario();
        this.obtenerAreas();
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        alert('No se pudo guardar el registro.');
      }
    });
  }

  cargarArea(areaSeleccionada: any) {
    this.isEditing = true;
    this.idAreaSeleccionada = areaSeleccionada.id_area;
    // Clonamos para evitar que se modifique la tabla mientras escribimos
    this.area = {
      nombre: areaSeleccionada.nombre,
      descripcion: areaSeleccionada.descripcion
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  actualizarArea() {
    if (this.idAreaSeleccionada) {
      this.apiService.updateArea(this.idAreaSeleccionada, this.area).subscribe({
        next: (res) => {
          alert('Área actualizada con éxito');
          this.limpiarFormulario();
          this.obtenerAreas();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    }
  }

  // Desactivar (Estado 0) - Usando el método DELETE del backend
  activarArea(id: number) {
  this.apiService.updateArea(id, { estado: 1 }).subscribe({
    next: () => {
      this.obtenerAreas(); // Actualiza primero
      // No pongas alert aquí si quieres que sea rápido
    }
  });
}

eliminarArea(id: number) {
  if(confirm('¿Desactivar?')) { // El confirm es antes
    this.apiService.deleteArea(id).subscribe({
      next: () => {
        this.obtenerAreas(); // Actualiza inmediatamente
      }
    });
  }
}

  cancelarEdicion() {
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.isEditing = false;
    this.idAreaSeleccionada = null;
    this.area = { 
      nombre: '', 
      descripcion: '' 
    };
  }
}