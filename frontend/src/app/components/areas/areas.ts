import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';
import { ChangeDetectorRef } from '@angular/core';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true
});

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './areas.html',
  styleUrl: './areas.css'
})
export class AreasComponent implements OnInit {
  listAreas: any[] = [];
  
  // Objeto para los inputs del formulario
  area: any = {
    nombre: '',
    descripcion: ''
  };

  isEditing: boolean = false;
  idAreaSeleccionada: number | null = null;

  constructor(private apiService: ApiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerAreas();
  }

  // Trae todos los registros para poder alternar entre Activo/Inactivo
  obtenerAreas() {
  this.apiService.getAreas().subscribe({
    next: (res: any[]) => {
       this.listAreas = [...res];
       this.cd.detectChanges();
    },
    error: (err) => console.error('Error al obtener áreas:', err)
  });
}

  guardarNuevaArea() {

  if (!this.area.nombre.trim()) {
    Swal.fire('Campo obligatorio', 'El nombre del área es obligatorio', 'warning');
      return;
  }

  // Loader
  Swal.fire({
    title: 'Guardando...',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading();
    }
  });

  this.apiService.saveArea(this.area).subscribe({
    next: (res: any) => {

      Swal.close();

      Toast.fire({
        icon: 'success',
        title: 'Área registrada correctamente'
      });
      if (res) {
        this.listAreas = [res, ...this.listAreas];
      } else {
        this.obtenerAreas();
      }
      this.limpiarFormulario();
      this.obtenerAreas();
    },

    error: (err) => {
      Swal.close();
      Swal.close();
        Swal.fire('Error', 'No se pudo guardar', 'error');
        console.error(err);
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

    Swal.fire({
      title: 'Actualizando...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.apiService.updateArea(this.idAreaSeleccionada, this.area).subscribe({
      next: () => {

        Swal.close();

        Toast.fire({
          icon: 'success',
          title: 'Área actualizada'
        });
        this.listAreas = this.listAreas.map(item =>
          item.id_area === this.idAreaSeleccionada
            ? { ...item, ...this.area }
            : item
        );
        
        this.limpiarFormulario();
      this.obtenerAreas();
    
      },

      error: (err) => {
        Swal.close();
        Swal.fire('Error', 'No se pudo actualizar', 'error');
        console.error(err);
      }
    });
  }
}

  // Desactivar (Estado 0) - Usando el método DELETE del backend
  activarArea(id: number) {
  this.apiService.updateArea(id, { estado: 1 }).subscribe({
    next: () => {  
      this.obtenerAreas();
     // Actualiza primero
      // No pongas alert aquí si quieres que sea rápido
    }
  });
}

eliminarArea(id: number) {

  Swal.fire({
    title: '¿Desactivar área?',
    text: 'El registro se marcará como inactivo',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, desactivar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#f59e0b'
  }).then((result) => {

    if (result.isConfirmed) {

      Swal.fire({
        title: 'Desactivando...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      this.apiService.deleteArea(id).subscribe({
        next: () => {

          Swal.close();

          Toast.fire({
            icon: 'success',
            title: 'Área desactivada'
          }); 
      this.obtenerAreas();
    
        },

        error: () => {
          Swal.close();

          Swal.fire({
            icon: 'error',
            title: 'Error al desactivar'
          });
        }
      });

    }

  });

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
  trackById(index: number, item: any) {
    return item.id_area;
  }

}