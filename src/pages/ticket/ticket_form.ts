import { Component } from "@angular/core";
import { ModalController, NavController, NavParams } from "ionic-angular";
import * as _ from "lodash";
import { BackendService } from "../../backend/backend.service";
import { DropdownSelect } from "../../dropdownselect/dropdownselect";

@Component({
  providers: [ BackendService ],
  selector: "ticket_form",
  templateUrl: "ticket_form.html",
})
export class TicketForm {
  public selectedItem: any;
  public followups: any;
  public timeline: any;
  public changed: boolean;
  public changedFields = [];
  public actors: {};
  public groups: {};
  public ticketzone: string = "summary";
  public types = [
    {value: 1, viewValue: "Incident"},
    {value: 2, viewValue: "Request"},
  ];
  public status = [
    {value: 1, viewValue: "New"},
    {value: 2, viewValue: "Processing (assigned)"},
    {value: 3, viewValue: "Processing (planned)"},
    {value: 4, viewValue: "Pending"},
    {value: 5, viewValue: "Solved"},
    {value: 6, viewValue: "Closed"},
  ];
  public priorities = [
    {value: 6, viewValue: "Major"},
    {value: 5, viewValue: "Very high"},
    {value: 4, viewValue: "High"},
    {value: 3, viewValue: "Medium"},
    {value: 2, viewValue: "Low"},
    {value: 1, viewValue: "Very low"},
  ];
  public urgencyImpact = [
    {value: 5, viewValue: "Very high"},
    {value: 4, viewValue: "High"},
    {value: 3, viewValue: "Medium"},
    {value: 2, viewValue: "Low"},
    {value: 1, viewValue: "Very low"},
  ];
  public addActors = {
    groups_id: 0,
    groups_name: "",
    showGroup: false,
    showUser: false,
    users_id: 0,
    users_name: "",
  };

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpService: BackendService,
              public modalCtrl: ModalController) {
    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get("item");

    // Get the ticket
    this.changed = false;
    this.timeline = [];
    this.actors = {};
    this.groups = {};
    this.changedFields = [];

    if (this.selectedItem.id > 0) {
      this.httpService.getItem("Ticket", this.selectedItem.id)
        .subscribe(function(data) {
          data.date = data.date.replace(" ", "T");
          data.date_mod = data.date_mod.replace(" ", "T");
          if (data.solvedate != null) {
            data.solvedate = data.solvedate.replace(" ", "T");
          }
          if (data.closedate != null) {
            data.closedate = data.closedate.replace(" ", "T");
          }
          this.selectedItem = data;
        }.bind(this));

      // Get followups
      this.httpService.getPage("TicketFollowup", {tickets_id: this.selectedItem.id},
        true, true, false, "0-200")
        .subscribe(function(data) {
          this.followups = data;
          for (const item of data) {
            item.date = item.date.replace(" ", "T");
            const myDate = new Date(item.date);
            item._type = "md-chatboxes";
            item._color = "ticketfollowup";
            item._date = myDate.getTime();
            this.timeline.push(item);
          }
          this.timeline = _.orderBy(this.timeline, "_date", "desc");
        }.bind(this));

      // Get tasks
      this.httpService.getPage("TicketTask", {tickets_id: this.selectedItem.id},
        true, true, false, "0-200")
        .subscribe(function(data) {
          for (const item of data) {
            item.date = item.date.replace(" ", "T");
            const myDate = new Date(item.date);
            item._type = "md-checkbox-outline";
            item._color = "tickettask";
            item._date = myDate.getTime();
            this.timeline.push(item);
          }
          this.timeline = _.orderBy(this.timeline, "_date", "desc");
        }.bind(this));

      // get actors
      this._getActors();

      // get groups
      this._getGroups();
    } else {
      this.selectedItem.type = 1;
    }
  }

  public openDropdownSelect(itemtype) {
    const modal = this.modalCtrl.create(DropdownSelect, {itemtype});
    modal.onDidDismiss(function(data) {
      this.changed = true;
      if (itemtype === "ITILCategory") {
        this.selectedItem.itilcategories_id = data.value;
        this.itilcategories_name = data.viewValue;
      } else if (itemtype === "RequestType") {
        this.selectedItem.requesttypes_id = data.value;
        this.requesttypes_name = data.viewValue;
      } else if (itemtype === "Location") {
        this.selectedItem.locations_id = data.value;
        this.locations_name = data.viewValue;
      }
    }.bind(this));
    modal.present();
  }

  public updateItem() {
    const input = {};
    for (const item of this.changedFields) {
      input[item] = this.selectedItem[item];
    }
    this.httpService.saveItem("Ticket", this.selectedItem.id, input)
      .subscribe(function(data) {
        this.changed = false;
        this.changedFields = [];
      }.bind(this));
  }

  public changeField(field) {
    this.changed = true;
    this.changedFields.push(field);
  }

  private _getActors() {
    this.httpService.getPage("Ticket_User", {tickets_id: this.selectedItem.id},
      true, true, false, "0-200")
      .subscribe(function(data) {
        this.actors = {};
        this.actors.demandeurs = [];
        this.actors.observateurs = [];
        this.actors.assignes = [];
        for (const item of data) {
          if (item.type === 1) {
            this.actors.demandeurs.push(item);
          } else if (item.type === 2) {
            this.actors.assignes.push(item);
          } else if (item.type === 3) {
            this.actors.observateurs.push(item);
          }
        }
      }.bind(this));
  }

  private _getGroups() {
    this.httpService.getPage("Group_Ticket", {tickets_id: this.selectedItem.id},
      true, true, false, "0-200")
      .subscribe(function(data) {
        this.groups = {};
        this.groups.demandeurs = [];
        this.groups.observateurs = [];
        this.groups.assignes = [];
        for (const item of data) {
          if (item.type === "1") {
            this.groups.demandeurs.push(item);
          } else if (item.type === "2") {
            this.groups.assignes.push(item);
          } else if (item.type === "3") {
            this.groups.observateurs.push(item);
          }
        }
      }.bind(this));
  }
}
