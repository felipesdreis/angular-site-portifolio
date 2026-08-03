import { Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appParallax]'
})
export class ParallaxDirective implements OnInit, OnDestroy {
  @Input('appParallax') speed = 0.2;

  /** teto do deslocamento para elementos `position: fixed`, que não têm posição de documento pra ancorar o cálculo */
  private readonly maxFixedOffset = 50;

  private baseTop = 0;
  private isFixed = false;
  private ticking = false;
  private reducedMotion = false;
  private onScroll = () => this.requestTick();

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2, private zone: NgZone) {}

  ngOnInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducedMotion) {
      return;
    }
    this.isFixed = getComputedStyle(this.el.nativeElement).position === 'fixed';
    if (!this.isFixed) {
      this.measure();
    }
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      if (!this.isFixed) {
        window.addEventListener('resize', this.measure, { passive: true });
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.measure);
  }

  private measure = () => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.baseTop = rect.top + window.scrollY;
  };

  private requestTick(): void {
    if (this.ticking) {
      return;
    }
    this.ticking = true;
    requestAnimationFrame(() => {
      this.apply();
      this.ticking = false;
    });
  }

  private apply(): void {
    const offset = this.isFixed ? this.fixedOffset() : this.documentOffset();
    this.renderer.setStyle(this.el.nativeElement, 'transform', `translate3d(0, ${offset}px, 0)`);
  }

  /** elemento fixo não se move com o documento — não há posição "original" pra ancorar, então usa scrollY direto, limitado a um teto pra nunca sair da folga visual do elemento */
  private fixedOffset(): number {
    const raw = window.scrollY * this.speed;
    return Math.max(-this.maxFixedOffset, Math.min(this.maxFixedOffset, raw));
  }

  private documentOffset(): number {
    const height = this.el.nativeElement.offsetHeight;
    const elementCenter = this.baseTop - window.scrollY + height / 2;
    const viewportCenter = window.innerHeight / 2;
    return (viewportCenter - elementCenter) * this.speed;
  }
}
