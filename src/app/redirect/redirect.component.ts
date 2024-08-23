import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-redirect',
  templateUrl: './redirect.component.html',
  styleUrls: ['./redirect.component.css']
})
export class RedirectComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.location.href = 'https://drive.google.com/drive/folders/1K6036Zt9cRQwCNB_krFez8YJG2KjH6Hp?usp=sharing';
  }

}
