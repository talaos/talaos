import { Component} from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { BackendService } from "../backend/backend.service";

@Component({
    providers: [ BackendService ],
    templateUrl: "dropdownselect.html",
})
export class DropdownSelect {
  public itemtype;
  public mysearch;
  public fields;
  public items;
  public mySearchInput = "";

  constructor(private httpService: BackendService, public params: NavParams, public viewCtrl: ViewController) {
    this.itemtype = this.params.get("itemtype");
    this.items = [];
    this.getItems();
  }

  public getItems() {
    this.httpService.getPage(this.itemtype, {name: this.mySearchInput},
      true, true, false, "0-10")
      .subscribe(function(data) {
        this.followups = data;
        this.items = [];
        for (const item of data) {
          const myrow = {
            id: item.id,
            name: "",
          };
          if (typeof item.completename !== "undefined") {
            myrow.name = item.completename;
          } else {
            myrow.name = item.name;
          }
          this.items.push(myrow);
        }
      }.bind(this));
  }

  public CloseModal(item) {
    this.viewCtrl.dismiss({value: item.id, viewValue: item.name});
  }
}
