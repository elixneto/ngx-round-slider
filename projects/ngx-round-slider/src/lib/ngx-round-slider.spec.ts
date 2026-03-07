import { NgxRoundSlider } from './ngx-round-slider';

describe('NgxRoundSlider', () => {
  let component: NgxRoundSlider;

  beforeEach(() => {
    component = new NgxRoundSlider();
    component.radius = 100;
    component.min = 0;
    component.max = 360;
    component.start = 0;
    component.end = 360;
  });

  function mockMouseEvent(x: number, y: number, svgSize = 200): MouseEvent {
    const event = {
      clientX: x,
      clientY: y,
      target: {
        closest: () => ({
          getBoundingClientRect: () => ({
            left: 0,
            top: 0,
            width: svgSize,
            height: svgSize,
          }),
        }),
      },
    } as unknown as MouseEvent;
    return event;
  }

  it('deve permitir que o start chegue em 0°', () => {
    component.setActive('start');
    // ponto à esquerda do centro
    const event = mockMouseEvent(0, 100);
    component.updateAngle(event);
    expect(component.start).toBe(0);
  });

  it('deve permitir que o end chegue em 360°', () => {
    component.setActive('end');
    // ponto à esquerda do centro
    const event = mockMouseEvent(0, 100);
    component.updateAngle(event);
    expect(component.end).toBe(360);
  });

  it('não deve permitir que start ultrapasse end', () => {
    component.start = 100;
    component.end = 120;
    component.setActive('start');
    // tenta mover start para 130 (maior que end)
    const event = mockMouseEvent(200, 100);
    component.updateAngle(event);
    expect(component.start).toBeLessThan(component.end);
  });

  it('não deve permitir que end seja menor que start', () => {
    component.start = 100;
    component.end = 120;
    component.setActive('end');
    // tenta mover end para 90 (menor que start)
    const event = mockMouseEvent(150, 100);
    component.updateAngle(event);
    expect(component.end).toBeGreaterThanOrEqual(component.start);
  });
});
