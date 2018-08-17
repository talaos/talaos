import { Component } from "@angular/core";
import { LoadingController, ModalController, NavController, NavParams } from "ionic-angular";
import { GlobalVars } from "../../../app/globalvars";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { Searchmodal } from "./searchmodal";

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

  public drows = [
    { name: "Austin", gender: "Male", company: "Swimlane" },
    { name: "Dany", gender: "Male", company: "KFC" },
    { name: "Molly", gender: "Female", company: "Burger King" },
  ];
  public dcolumns = [];

// https://codepen.io/anon/pen/pjzKMZ
// https://codepen.io/anon/pen/gPGzdK

// https://swimlane.github.io/ngx-datatable/
// https://ionicframework.com/docs/api/components/grid/Grid/
// https://github.com/TonyGermaneri/canvas-datagrid
// https://github.com/fin-hypergrid/core
// https://codepen.io/calendee/pen/vkgtz / https://calendee.com/2014/06/26/responsive-columns-in-an-ionic-list/

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
    this.forcedisplayBase = [1, 2, 80, 12, 19, 14, 7, 82, 27, 28];
    this.forcedisplaySup = [];
    this.selectedItem = navParams.get("item");
  }

  public ngOnInit() {
    this.page(this.offset, this.limit);
  }

  public openModal(characterNum) {
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
      /*
              let type = "Incident";
              let statusIcon = "";
              let statusColor = "";

              if (item[12] === 1) {
                statusIcon = "md-bulb";
                statusColor = "primary";
              } else if (item[12] === 2) {
                statusIcon = "md-person";
                statusColor = "primary";
              } else if (item[12] === 3) {
                statusIcon = "md-calendar";
                statusColor = "primary";
              } else if (item[12] === 4) {
                statusIcon = "md-pause";
                statusColor = "light";
              } else if (item[12] === 5) {
                statusIcon = "md-checkmark";
                statusColor = "secondary";
              } else if (item[12] === 6) {
                statusIcon = "md-done-all";
                statusColor = "secondary";
              }

              // Manage late
              if (item[82] === 1) {
                if (item[12] < 4) {
                  statusIcon = "md-bonfire";
                  statusColor = "danger";
                }
              }

              if (item[14] === 2) {
                type = "Demande";
              }

              const myrow = {
                category: item[7],
                date_mod: item[19],
                id: item[2],
                name: item[1],
                note: "",
                numberfollowups: item[27],
                numbertasks: item[28],
                statusColor,
                statusIcon,
                type,
              };
              for (const sup of this.forcedisplaySup) {
                myrow[sup] = item[sup];
              }
              */
      if (this.dcolumns.length === 0) {
        const columns = [];
        for (const fielduid of Object.keys(item)) {
          columns.push({
            name: item[fielduid].name,
            prop: item[fielduid].name,
          });
        }
        this.dcolumns = [...columns];
      }
      const myrow = {};
      for (const fielduid of Object.keys(item)) {
        myrow[item[fielduid].name] = item[fielduid].value; // item[itemid];
      }
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

}
