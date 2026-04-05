import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';

@Component({
  selector: 'app-validacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validacion.html',
  styleUrl: './validacion.css',
})
export class ValidacionComponent implements OnInit, OnDestroy {
  public user: any = null;
  public escaneando: boolean = false;
  public resultado: any = null;
  public manualToken: string = '';
  public ultimosAccesos: any[] = [];
  public cargandoAccesos: boolean = false;

  private html5QrCode: Html5Qrcode | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const session = localStorage.getItem('usuarioLogueado');
      if (!session) {
        this.router.navigate(['/login']);
        return;
      }
      this.user = JSON.parse(session);
      this.cargarAccesos();
    }
  }

  ngOnDestroy(): void {
    this.detenerCamara();
  }

  iniciarCamara() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resultado = null;
    this.escaneando = true;

    setTimeout(() => {
      this.html5QrCode = new Html5Qrcode('qr-reader');
      this.html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            this.detenerCamara();
            this.validarToken(decodedText);
          },
          () => { /* scan errors are intentionally ignored */ },
        )
        .catch(() => {
          this.escaneando = false;
          Swal.fire({ icon: 'error', title: 'Cámara no disponible', text: 'No se pudo acceder a la cámara.' });
        });
    }, 100);
  }

  detenerCamara() {
    if (this.html5QrCode) {
      this.html5QrCode.isScanning &&
        this.html5QrCode.stop().catch(() => {});
      this.html5QrCode = null;
    }
    this.escaneando = false;
  }

  validarManual() {
    if (!this.manualToken.trim()) {
      Swal.fire({ icon: 'warning', title: 'Token vacío', text: 'Ingresa el código QR manualmente.' });
      return;
    }
    this.validarToken(this.manualToken.trim());
  }

  validarToken(token: string) {
    this.apiService.validarQR({ codigo_token: token, guardia_id: this.user?.id_usuario }).subscribe({
      next: (res: any) => {
        this.resultado = res;
        this.manualToken = '';
        this.cargarAccesos();
      },
      error: (err: any) => {
        this.resultado = err.error || { valido: false, error: 'Error al validar el código QR.' };
      },
    });
  }

  cargarAccesos() {
    this.cargandoAccesos = true;
    this.apiService.getAccesos().subscribe({
      next: (res: any) => {
        this.ultimosAccesos = res.slice(0, 10);
        this.cargandoAccesos = false;
      },
      error: () => (this.cargandoAccesos = false),
    });
  }

  limpiarResultado() {
    this.resultado = null;
    this.manualToken = '';
  }
}
