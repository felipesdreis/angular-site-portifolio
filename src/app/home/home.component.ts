import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
   openLink(tipoSocial: string){
    switch(tipoSocial){
      case 'l':
        window.open("https://www.linkedin.com/in/felipesdreis/", "_blank");
        break;
      case 'g':
        window.open("https://github.com/felipesdreis", "_blank");
        break;
      case 'i':
        window.open("https://www.instagram.com/felipesdreis/", "_blank");
        break;
    }
  }
}

