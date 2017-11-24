import { Component } from "@angular/core";
import { LoadingController, ModalController, NavController, NavParams } from "ionic-angular";
import { BackendService } from "../../backend/backend.service";
import { Search } from "../../search/search";
import { TicketForm } from "./ticket_form";

@Component({
  providers: [ BackendService ],
  selector: "page-list",
  templateUrl: "ticket.html",
})
export class TicketPage {
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
  public limit: number = 10;
  public sort = 2; // = ID
  public sortOrder = "ASC";
  public criteria = [];
  public forcedisplaySup;
  public forcedisplayBase;
  public loading;
  public infiniteloop = true;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpService: BackendService,
              public modalCtrl: ModalController, public loadingCtrl: LoadingController) {
    // If we navigated to this page, we will have an item available as a nav param
    this.criteria = [ { field: 12, searchtype: "equals", value: "notold" }];
    this.forcedisplayBase = [1, 2, 80, 12, 19, 14, 7, 82];
    this.forcedisplaySup = [];
    this.selectedItem = navParams.get("item");
  }

  public ngOnInit() {
    this.page(this.offset, this.limit);
  }

  public openModal(characterNum) {
    const modal = this.modalCtrl.create(Search, {itemtype: "Ticket"});
    modal.onDidDismiss(function(data) {
      if (data !== null) {
        this.criteria = data.criteria;
        this.forcedisplaySup = data.forcedisplay;
        this.page(0, 10);
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
    this.httpService.search("Ticket", this.forcedisplayBase.concat(this.forcedisplaySup),
      this.criteria, range, 19, "DESC")
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
    this.totalcount = data.totalcount;
    const rows = [];

    if (data.data !== undefined) {
      for (const item of data.data) {
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
          statusColor,
          statusIcon,
          type,
        };
        for (const sup of this.forcedisplaySup) {
          myrow[sup] = item[sup];
        }
        rows.push(myrow);

        // user picture http://127.0.0.1/glpi090/files/_pictures/b7/2_59eebad45dbb7_min.png
      }
    }
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
    this.navCtrl.push(TicketForm, {
      item,
    });
  }

  public doInfinite(infiniteScroll) {
    setTimeout(() => {
      this.offset += 1;
      this.page(this.offset, this.limit);

      infiniteScroll.complete();
    }, 500);
  }

}
