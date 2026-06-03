import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  QueryList,
  ViewChildren
} from '@angular/core';

@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.component.html',
  styleUrls: ['./projetos.component.css']
})
export class ProjetosComponent implements AfterViewInit, OnDestroy {

  public projects = [
    {
      nome: 'wtm-work-time-manager',
      link: 'https://github.com/felipesdreis/wtm-work-time-manager/',
      banner: 'https://github.com/felipesdreis/wtm-work-time-manager/blob/main/imagens/demo.gif?raw=true',
    },
    {
      nome: 'dash-formulaone-2021',
      link: 'https://github.com/felipesdreis/dash-formulaone-2021',
      banner: 'https://github.com/felipesdreis/dash-formulaone-2021/raw/main/pictures/usev1.gif',
    },
    {
      nome: 'web_stopwatch_work',
      link: 'https://github.com/felipesdreis/web_stopwatch_work',
      banner: 'https://github.com/felipesdreis/web_stopwatch_work/raw/main/interface-uso.png',
    },
  ];

  @ViewChildren('cardRef') cardElements!: QueryList<ElementRef<HTMLElement>>;

  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px'
      }
    );

    this.cardElements.forEach((cardRef) => {
      this.observer!.observe(cardRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
