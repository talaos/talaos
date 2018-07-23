import { Component } from "@angular/core";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";

import { TranslateService } from "@ngx-translate/core";

@Component({
  providers: [ BackendGlpiService ],
  selector: "glpi-menu",
  templateUrl: "menu.html",
})

export class GlpiMenu {

  public pages = [];
  public itemtypes = {};

  constructor(private httpGlpiService: BackendGlpiService, translate: TranslateService) {
    this.itemtypes = {
      Computer: "Computers",
      Monitor: "Monitors",
      Software: "Softwares",
      NetworkEquipment: "Network devices",
      Peripheral: "Devices",
      Printer: "Printers",
      Phone: "Phones",
    };
    this.loadMenu();
  }

  private loadMenu() {
    for (let itemtype in this.itemtypes) {
      this.httpGlpiService.search(itemtype, [1, 2, 80], [], "0-1")
        .subscribe(function(data) {
          if (data.totalcount > 0) {
            this.pages.push({name: this.itemtypes[itemtype], number: data.totalcount});
          }
        }.bind(this));
    }
  }
}
