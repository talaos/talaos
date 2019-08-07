import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  pages = [
    {
      title: 'Main',
      url: '/menu/main',
      icon: 'home'
    },
    {
      title: 'CMDB',
      children: [
        {
          title: 'Inventory',
          url: '/menu/inventory',
          icon: 'home'
        },
        {
          title: 'Applications',
          url: '/menu/applications',
          icon: 'home'
        },
        {
          title: 'Deploy software',
          url: '/menu/deploy',
          icon: 'home'
        },
      ]
    },
    {
      title: 'Assistance',
      children: [
        {
          title: 'Incident',
          url: '/menu/incident',
          icon: 'home'
        },
      ],
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
