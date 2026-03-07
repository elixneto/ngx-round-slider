import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { NgxRoundSliderStyles } from './ngx-round-slider-styles';

@Component({
  selector: 'ngx-round-slider',
  standalone: true,
  imports: [],
  templateUrl: './ngx-round-slider.html',
  styleUrl: './ngx-round-slider.css',
})
export class NgxRoundSlider implements AfterViewInit {
  @Input() disabled = false;
  @Input() radius = 100;
  @Input() strokePathWidth = 20;

  @Input() start = 0;
  @Output() startChange = new EventEmitter<number>();
  @Input() end = 0;
  @Output() endChange = new EventEmitter<number>();
  @Input() min = 0;
  @Input() max = 360;

  @Input() styleClasses?: NgxRoundSliderStyles;

  // handlers
  circleHandlersOrder: ('start' | 'end')[] = ['start', 'end'];
  activeHandler: 'start' | 'end' | null = null;
  inversionToleranceDeg = 5;

  ngAfterViewInit(): void {
    if (this.start < this.min) {
      this.start = this.min;
      this.startChange.emit(this.start);
    }

    if (this.end > this.max) {
      this.end = this.max;
      this.endChange.emit(this.end);
    }

    if (this.start > this.end) {
      const oldStart = this.start;
      const oldEnd = this.end;

      this.start = oldEnd;
      this.startChange.emit(this.start);
      this.end = oldStart;
      this.endChange.emit(this.end);
    }
  }

  setActive(handle: 'start' | 'end') {
    this.activeHandler = handle;
    this.circleHandlersOrder = this.activeHandler === 'start' ? ['end', 'start'] : ['start', 'end'];
  }

  updateAngle(event: MouseEvent) {
    if (!this.activeHandler) {
      return;
    }

    const svg = (event.target as SVGElement).closest('svg');
    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = event.clientX - cx;
    const dy = event.clientY - cy;

    // atan2 retorna em radianos, converter para graus
    let deg = Math.atan2(-dy, -dx) * (180 / Math.PI);

    // normaliza para [0, 360)
    if (deg < 0) {
      deg += 360;
    }
    deg = Math.round(deg);

    // se for o start, 360 deve virar 0
    if (this.activeHandler === 'start' && deg === 360) {
      deg = 0;
    }

    // se for o end, -0 deve virar 360
    if (this.activeHandler === 'end' && deg === 0) {
      deg = 360;
    }

    // inverte para comecar grau 0 na esquerda sentido horario
    if (deg < 0 && this.activeHandler === 'end') {
      deg += 360;
    }

    // corrige -0 → 0
    if (Object.is(deg, -0)) {
      deg = 0;
    }

    const isOutbound = deg < this.min || deg > this.max;
    if (isOutbound) {
      return;
    }

    if (this.activeHandler === 'start') {
      if (deg > this.end) {
        return;
      }
      // caso especial: atualmente é 0 e 360 e quer diminuir até {{inversionToleraceDeg}}
      if (this.start === 0 && this.end === 360 && deg > (360 - this.inversionToleranceDeg)) {
        return;
      }

      this.start = Math.round(deg);
      this.startChange.emit(this.start);
    } else if (this.activeHandler === 'end') {
      if (deg < this.start) {
        return;
      }
      // caso especial: atualmente é 0 e 360 e quer aumentar ate {{inversionToleraceDeg}}
      if (this.start === 0 && this.end === 360 && deg < this.inversionToleranceDeg) {
        return;
      }

      this.end = Math.round(deg);
      this.endChange.emit(this.end);
    }
  }

  // coordenadas dos handles (0° = esquerda)
  getHandleX(angle: number) {
    return this.radius * Math.cos(((angle - 180) * Math.PI) / 180);
  }
  getHandleY(angle: number) {
    return this.radius * Math.sin(((angle - 180) * Math.PI) / 180);
  }

  // arco cinza (limite permitido)
  getLimitArcPath() {
    if (this.min === 0 && this.max === 360) {
      const cx = this.radius + 10;
      const cy = this.radius + 10;
      return `M ${cx - this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx + this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx - this.radius} ${cy}`;
    }
    const startX = this.getHandleX(this.min) + this.radius + 10;
    const startY = this.getHandleY(this.min) + this.radius + 10;
    const endX = this.getHandleX(this.max) + this.radius + 10;
    const endY = this.getHandleY(this.max) + this.radius + 10;

    const largeArc = (this.max - this.min + 360) % 360 > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${this.radius} ${this.radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  }

  // arco pontilhado (fora dos limites)
  getExcludedArcPath() {
    const cx = this.radius + 10;
    const cy = this.radius + 10;

    const startX = this.getHandleX(this.max) + cx;
    const startY = this.getHandleY(this.max) + cy;
    const endX = this.getHandleX(this.min) + cx;
    const endY = this.getHandleY(this.min) + cy;

    const largeArc = (this.min - this.max + 360) % 360 > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${this.radius} ${this.radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  }

  // arco entre start e end
  getArcPath() {
    if (this.start === 0 && this.end === 360) {
      const cx = this.radius + 10;
      const cy = this.radius + 10;
      return `M ${cx - this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx + this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx - this.radius} ${cy}`;
    }

    const startX = this.getHandleX(this.start) + this.radius + 10;
    const startY = this.getHandleY(this.start) + this.radius + 10;
    const endX = this.getHandleX(this.end) + this.radius + 10;
    const endY = this.getHandleY(this.end) + this.radius + 10;

    const largeArc =
      (this.start === 0 && this.end === 360) || (this.end - this.start + 360) % 360 > 180 ? 1 : 0;

    return `M ${startX} ${startY} A ${this.radius} ${this.radius} 0 ${largeArc} 1 ${endX} ${endY}`;
  }

  // área preenchida (cone do ângulo selecionado)
  getConePath() {
    if (this.start === 0 && this.end === 360) {
      const cx = this.radius + 10;
      const cy = this.radius + 10;
      return `M ${cx - this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx + this.radius} ${cy} A ${this.radius} ${this.radius} 0 1 1 ${cx - this.radius} ${cy}`;
    }

    const cx = this.radius + 10;
    const cy = this.radius + 10;

    const startX = this.getHandleX(this.start) + cx;
    const startY = this.getHandleY(this.start) + cy;
    const endX = this.getHandleX(this.end) + cx;
    const endY = this.getHandleY(this.end) + cy;

    const largeArc = (this.end - this.start + 360) % 360 > 180 ? 1 : 0;

    // M centro → L ponto inicial → arco até ponto final → Z fecha no centro
    return `M ${cx} ${cy} L ${startX} ${startY} A ${this.radius} ${this.radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;
  }
}
