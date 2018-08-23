import {Component} from "@angular/core";

import { BackendGlpiService } from "../../../backends/backend.glpi.service";

import { TranslateService } from "@ngx-translate/core";
import { App } from "ionic-angular";
import { SearchPage } from "../generic/searchlist";
import {TicketPage} from "../ticket/ticket";

@Component({
  providers: [ BackendGlpiService ],
  selector: "glpi-menu",
  templateUrl: "menu.html",
})

export class GlpiMenu {

  public pages = [];
  public itemtypes = [];
  public submenu = [];
  public currentmenu = "";
  public onlyWithData = true;

  constructor(private httpGlpiService: BackendGlpiService, translate: TranslateService, public appCtrl: App) {

    this.onlyWithData = true;
    this.currentmenu = "";
    this.submenu = [
      {type: "asset", name: "Assets"},
      {type: "assistance", name: "Assistance"},
      {type: "management", name: "Management"},
      {type: "tool", name: "Tools"},
    ];
    this.itemtypes = [
      {order: 0, submenu: "asset", type: "Computer", name: "Computers"},
      {order: 1, submenu: "asset", type: "Monitor", name: "Monitors"},
      {order: 2, submenu: "asset", type: "Software", name: "Softwares"},
      {order: 3, submenu: "asset", type: "NetworkEquipment", name: "Network devices"},
      {order: 4, submenu: "asset", type: "Peripheral", name: "Devices"},
      {order: 5, submenu: "asset", type: "Printer", name: "Printers"},
      {order: 6, submenu: "asset", type: "CartridgeItem", name: "Cartridges"},
      {order: 7, submenu: "asset", type: "ConsumableItem", name: "Consumables"},
      {order: 8, submenu: "asset", type: "Phone", name: "Phones"},
      {order: 9, submenu: "asset", type: "Rack", name: "Racks"},
      {order: 10, submenu: "asset", type: "Enclosure", name: "Enclosures"},
      {order: 11, submenu: "asset", type: "PDU", name: "PDUs"},

      {order: 0, submenu: "assistance", type: "Ticket", name: "Tickets"},
      {order: 1, submenu: "assistance", type: "Problem", name: "Problems"},
      {order: 2, submenu: "assistance", type: "Change", name: "Changes"},
      {order: 3, submenu: "assistance", type: "TicketRecurrent", name: "Recurrent tickets"},
//      {order: 4, submenu: "assistance", type: "Planning", name: "Planning"},
//      {order: 5, submenu: "assistance", type: "Stat", name: "Statistics"},

      {order: 0, submenu: "management", type: "SoftwareLicense", name: "Licenses"},
    ];
  }

  public loadMenu(submenu) {
    this.currentmenu = submenu;
    this.pages = [];
    for (const datatype of this.itemtypes) {
      if (datatype.submenu === submenu) {
        this.pages.push({name: datatype.name, number: 0, order: datatype.order, type: datatype.type});
        this.httpGlpiService.search(datatype.type, [1, 2, 80], [], "0-1")
          .subscribe(function(data) {
            this.pages[(datatype.order)].number = data.meta.totalcount;
          }.bind(this));
      }
    }
  }

  public return() {
    this.pages = [];
    this.currentmenu = "";
  }

  public goToPage(page) {
    this.appCtrl.getRootNav().push(SearchPage, {itemtype: page});
  }

}
