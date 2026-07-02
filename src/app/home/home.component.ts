import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  navBg = 'transparent';
  navBorder = '1px solid transparent';

  @HostListener('window:scroll')
  onScroll() {
    const solid = window.scrollY > 60;
    this.navBg = solid ? 'rgba(15,13,19,0.88)' : 'transparent';
    this.navBorder = solid ? '1px solid rgba(33,31,38,0.9)' : '1px solid transparent';
  }
}
