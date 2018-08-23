import { Component, ViewChild} from "@angular/core";
import { LoadingController, ModalController, NavController, NavParams } from "ionic-angular";
import { GlobalVars } from "../../../app/globalvars";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { SearchPreferenceModal } from "./modals/search.preference.modal";
import { Searchmodal } from "./searchmodal";

// Import search templates
import { SearchTemplateTicket } from "./searchtemplates/searchtemplate.ticket";
import {TicketForm} from "../ticket/ticket_form";

@Component({
  providers: [ BackendGlpiService ],
  selector: "page-search",
  templateUrl: "searchlist.html",
})
export class SearchPage {
  public selectedItem: any;
  public items: Array<{
    name: string,
    note: string,
    icon: string,
    date_mod: string,
    status: string,
    type: string,
    category: string,
    id: number,
  }>;
  public totalcount: number = 0;
  public itemscount: number = 0;
  public offset: number = 0;
  public limit: number = 31;
  public sort = 1; // = name
  public sortOrder = "ASC";
  public criteria = [];
  public itemtype = "";
  public forcedisplaySup;
  public forcedisplayBase;
  public loading;
  public infiniteloop = true;

  public templates;

  public drows = [
    { name: "Austin", gender: "Male", company: "Swimlane" },
    { name: "Dany", gender: "Male", company: "KFC" },
    { name: "Molly", gender: "Female", company: "Burger King" },
  ];
  public dcolumns = [];

  public componentRef: any;

  @ViewChild(SearchTemplateTicket)
  private searchTemplate: SearchTemplateTicket;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpService: BackendGlpiService,
              public modalCtrl: ModalController, public loadingCtrl: LoadingController,
              private globalVars: GlobalVars) {
    // If we navigated to this page, we will have an item available as a nav param
    const criteria = navParams.get("criteria");
    this.itemtype = navParams.get("itemtype");
    if (criteria === "undefined") {
      this.criteria = [{field: 12, searchtype: "equals", value: "notold"}];
    } else {
      this.criteria = criteria;
    }
    this.sort = 1;
    if (this.itemtype === "Ticket") {
      this.sort = 2; // the ID
    }
    this.forcedisplayBase = [1, 2, 80];
    this.forcedisplaySup = [];
    this.selectedItem = navParams.get("item");

    this.templates = ["Ticket__Status"];
  }

  public ngOnInit() {
    this.getColumnsToDisplay();
  }

  public openModalSearch() {
    const modal = this.modalCtrl.create(Searchmodal, {itemtype: this.itemtype});
    modal.onDidDismiss(function(data) {
      if (data !== null) {
        this.criteria = data.criteria;
        this.forcedisplaySup = data.forcedisplay;
        this.page(0, 31);
      }
    }.bind(this));
    modal.present();
  }

  public openModalPreference() {
    const modal = this.modalCtrl.create(SearchPreferenceModal, {itemtype: this.itemtype});
    modal.onDidDismiss(function(data) {
      this.getColumnsToDisplay();
    }.bind(this));
    modal.present();
  }

  public page(offset, limit) {
    const range = 0 + "-" + ((offset * limit) + limit);

    this.loading = this.loadingCtrl.create({
      content: "Please wait...",
    });
    this.loading.present();
    this.httpService.search(this.itemtype, this.forcedisplayBase.concat(this.forcedisplaySup),
      this.criteria, range, this.sort, this.sortOrder)
      .subscribe(
        function(data) {
          return this.parsePage(data);
        }.bind(this),
        function(error) {
          return this.httpService.manageError(error);
        }.bind(this),
      );
  }

  public onSort(event) {
    this.sort = event.sorts[0].prop;
    if (event.sorts[0].dir === "asc") {
      this.sortOrder = "ASC";
    } else {
      this.sortOrder = "DESC";
    }
    this.page(this.offset, this.limit);
  }

  public parsePage(data) {
    this.totalcount = data.meta.totalcount;
    const rows = [];
    for (const item of data.data) {
      if (this.dcolumns.length === 0) {
        const columns = [];
        for (const fielduid of Object.keys(item)) {
          columns.push({
            cellTemplate: this.searchTemplate[fielduid],
            name: item[fielduid].name,
            prop: item[fielduid].name,
            uid: fielduid,
          });
        }
        this.dcolumns = [...columns];
      }
      const myrow = {};
      for (const fielduid of Object.keys(item)) {
        myrow[item[fielduid].name] = item[fielduid].value; // item[itemid];
      }
      console.log(myrow);
      rows.push(myrow);
    }
    this.drows = [...rows];

    this.items = rows;
    this.itemscount = this.items.length;
    if (this.itemscount === this.totalcount) {
      this.infiniteloop = false;
    }
    this.loading.dismiss();
  }

  public onPage(event) {
    this.page(event.offset, event.limit);
  }

  public itemTapped(event, item) {
    if (item === undefined) {
      item = {id: 0};
    }

    // That's right, we're pushing to ourselves!
//    this.navCtrl.push(TicketForm, {
//      item,
//    });
  }

  public doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.offset += 1;
      this.page(this.offset, this.limit);

      infiniteScroll.complete();
    }, 500);
  }

  public getColumnsToDisplay() {
    const where = {
      itemtype: "^" + this.itemtype + "$",
      users_id: "^" + this.globalVars.session["glpiID"] + "$",
    };
    this.forcedisplayBase = [1, 2, 80];
    this.dcolumns = [];
    // Get preferences of this user
    this.httpService.getItemsRestrict("DisplayPreference", where, false, true, false, "0-50", "rank")
      .subscribe((data) => {
        if (Object.keys(data.data).length === 0) {
          where.users_id = "^" + 0 + "$";
          this.httpService.getItemsRestrict("DisplayPreference", where, false, true, false, "0-50", "rank")
            .subscribe((dataAll) => {
              for (const item of Object.keys(dataAll.data)) {
                this.forcedisplayBase.push(dataAll.data[item].num);
              }
              this.page(this.offset, this.limit);
            });
        } else {
          for (const item of Object.keys(data.data)) {
            this.forcedisplayBase.push(data.data[item].num);
          }
          this.page(this.offset, this.limit);
        }
      });
  }

}
