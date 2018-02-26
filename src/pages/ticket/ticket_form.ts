import { Component } from "@angular/core";
import { FabContainer, ModalController, NavController, NavParams, ToastController } from "ionic-angular";
import * as _ from "lodash";
import { GlobalVars } from "../../app/globalvars";
import { BackendService } from "../../backend/backend.service";
import { DropdownSelect } from "../../dropdownselect/dropdownselect";

import { TranslateService } from "@ngx-translate/core";

@Component({
  providers: [ BackendService ],
  selector: "ticket_form",
  templateUrl: "ticket_form.html",
})
export class TicketForm {
  public selectedItem: any;
  public hiddenItem: any;
  public newfollowup: any;
  public newtask: any;
  public followups: any;
  public timeline: any;
  public changed: boolean;
  public changedFields = [];
  public actors: {};
  public groups: {};
  public ticketzone: string = "summary";
  public types = [];
  public status = [];
  public priorities = [];
  public urgencyImpact = [];
  public addActors = {
    groups_id: 0,
    groups_name: "",
    showGroup: false,
    showGroupAssigned: false,
    showUser: false,
    showUserAssigned: false,
    users_id: 0,
    users_name: "",
  };
  private disablechanges: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private httpService: BackendService,
              public modalCtrl: ModalController, translate: TranslateService, public toastCtrl: ToastController,
              private globalVars: GlobalVars) {

    const valueFieldName = "value";
    this.types = [
      {value: 1, viewValue: translate.get("Incident")[valueFieldName]},
      {value: 2, viewValue: translate.get("Request")[valueFieldName]},
    ];
    this.status = [
      {value: 1, viewValue: translate.get("New")[valueFieldName]},
      {value: 2, viewValue: translate.get("Processing (assigned)")[valueFieldName]},
      {value: 3, viewValue: translate.get("Processing (planned)")[valueFieldName]},
      {value: 4, viewValue: translate.get("Pending")[valueFieldName]},
      {value: 5, viewValue: translate.get("Solved")[valueFieldName]},
      {value: 6, viewValue: translate.get("Closed")[valueFieldName]},
    ];

    this.priorities = [
      {value: 6, viewValue: translate.get("Major")[valueFieldName]},
      {value: 5, viewValue: translate.get("Very high")[valueFieldName]},
      {value: 4, viewValue: translate.get("High")[valueFieldName]},
      {value: 3, viewValue: translate.get("Medium")[valueFieldName]},
      {value: 2, viewValue: translate.get("Low")[valueFieldName]},
      {value: 1, viewValue: translate.get("Very low")[valueFieldName]},
    ];
    this.urgencyImpact = [
      {value: 5, viewValue: translate.get("Very high")[valueFieldName]},
      {value: 4, viewValue: translate.get("High")[valueFieldName]},
      {value: 3, viewValue: translate.get("Medium")[valueFieldName]},
      {value: 2, viewValue: translate.get("Low")[valueFieldName]},
      {value: 1, viewValue: translate.get("Very low")[valueFieldName]},
    ];

    // If we navigated to this page, we will have an item available as a nav param
    this.selectedItem = navParams.get("item");
    this.hiddenItem = {};

    this.disablechanges = false;

    // Get the ticket
    this.changed = false;
    this.timeline = [];
    this.actors = {};
    this.groups = {};
    this.changedFields = [];
    this.newfollowup = {};
    this.newtask = {};

    if (this.selectedItem.id > 0) {
      this.httpService.getItem("Ticket", this.selectedItem.id)
        .subscribe(function(data) {
          this.disablechanges = true;
          data.date = data.date.replace(" ", "T");
          data.date_mod = data.date_mod.replace(" ", "T");
          if (data.solvedate != null) {
            data.solvedate = data.solvedate.replace(" ", "T");
          }
          if (data.closedate != null) {
            data.closedate = data.closedate.replace(" ", "T");
          }
          this.selectedItem = data;
          this.httpService.getItem("Ticket", this.selectedItem.id, false)
            .subscribe(function(dataNotExp) {
              if (dataNotExp.itilcategories_id === 0) {
                this.selectedItem.itilcategories_id = 0;
              } else {
                this.selectedItem.itilcategories_name = this.selectedItem.itilcategories_id;
                this.selectedItem.itilcategories_id = dataNotExp.itilcategories_id;
              }
              if (dataNotExp.requesttypes_id === 0) {
                this.selectedItem.requesttypes_id = 0;
              } else {
                this.selectedItem.requesttypes_name = this.selectedItem.requesttypes_id;
                this.selectedItem.requesttypes_id = dataNotExp.requesttypes_id;
              }
              if (dataNotExp.locations_id === 0) {
                this.selectedItem.locations_id = 0;
              } else {
                this.selectedItem.locations_name = this.selectedItem.locations_id;
                this.selectedItem.locations_id = dataNotExp.locations_id;
              }
              this.SetAllItemVisible();
              this.disablechanges = false;
            }.bind(this));
        }.bind(this));

      this.loadTimeline();

      // get actors
      this._getActors();

      // get groups
      this._getGroups();
    } else {
      this.selectedItem.type = 1;
      this.selectedItem.priority = 3;
      this.selectedItem.urgency = 3;
      this.selectedItem.impact = 3;
      this.selectedItem.status = 1;
      this.SetAllItemVisible();
    }
  }

  public loadTimeline() {
    this.timeline = [];

    // Get followups
    this.httpService.getPage("TicketFollowup", {tickets_id: this.selectedItem.id},
      true, true, false, "0-200")
      .subscribe(function(data) {
        this.followups = data;
        for (const item of data) {
          const myDate = new Date(item.date.replace(" ", "T"));
          if (item.requesttypes_id === 0) {
            item.requesttypes_id = "";
          }
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
  }

  public openDropdownSelect(itemtype, ticketitself: boolean, destination: string = "") {
    const modal = this.modalCtrl.create(DropdownSelect, {itemtype});
    modal.onDidDismiss(function(data) {
      if (ticketitself) {
        this.changed = true;
      }

      if (destination === "taskusertech") {
        this.newtask.users_id_tech = data.value;
        this.newtask.users_tech_name = data.viewValue;
      } else if (destination === "taskgrouptech") {
        this.newtask.groups_id_tech = data.value;
        this.newtask.groups_tech_name = data.viewValue;
      } else if (destination === "ticketcategory") {
        this.selectedItem.itilcategories_id = data.value;
        this.selectedItem.itilcategories_name = data.viewValue;
        this.changeField("itilcategories_id");
      } else if (destination === "ticketrequesttype") {
        this.selectedItem.requesttypes_id = data.value;
        this.selectedItem.requesttypes_name = data.viewValue;
        this.changeField("requesttypes_id");
      } else if (destination === "ticketlocation") {
        this.selectedItem.locations_id = data.value;
        this.selectedItem.locations_name = data.viewValue;
        this.changeField("locations_id");
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
        // only in case new ticket
        if (this.selectedItem.id === 0) {
          const item = {id: data.id};
          const currentpage = this.navCtrl.last();
          this.navCtrl
            .push(TicketForm, {
              item,
            });
          this.navCtrl.remove(this.navCtrl.indexOf(currentpage));
        }
        const toast = this.toastCtrl.create({
          duration: 3000,
          message: "Saved",
        });
        toast.present();
      }.bind(this));
  }

  public changeField(field) {
    if (!this.disablechanges) {
      this.changed = true;
      this.changedFields.push(field);

      // Manage the ticket template
      if (field === "itilcategories_id" || field === "type") {
        this.loadTemplate();
      }
    }
  }

  public loadTemplate() {
    // get the template for the category
    this.httpService.getItem("ITILCategory", this.selectedItem.itilcategories_id, false)
      .subscribe(function(data) {
        let templateId = 0;
        if (this.selectedItem.type === 1) {
          templateId = data.tickettemplates_id_incident;
        } else {
          templateId = data.tickettemplates_id_demand;
        }
        if (templateId === 0) {
          // load from entity

        }
        this.SetAllItemVisible();
      // Load the mandatory fields of the template TicketTemplateMandatoryField
        this.httpService.getPage("TicketTemplateMandatoryField", {tickettemplates_id: "^" + templateId + "$"},
          false, false, false, "0-200")
          .subscribe((data2) => {
            // console.log(data2);
          });

      // load the predefined fields TicketTemplatePredefinedField
        this.httpService.getPage("TicketTemplatePredefinedField", {tickettemplates_id: "^" + templateId + "$"},
          false, false, false, "0-200")
          .subscribe((data2) => {
            for (const item of data2) {
              if (item.num && item.num !== "undefined") {
                this.selectedItem[this.globalVars.searchOptions.ticket[item.num].field] = item.value;
              }
            }
          });

      // load the hidden fields TicketTemplateHiddenField
        this.httpService.getPage("TicketTemplateHiddenField", {tickettemplates_id: "^" + templateId + "$"},
          false, false, false, "0-200")
          .subscribe(function(data2) {
            for (const item of data2) {
              if (item.num && item.num !== "undefined") {
                this.hiddenItem["id" + this.globalVars.searchOptions.ticket[item.num].id] = true;
              }
            }
          }.bind(this));

    }.bind(this));
  }

  public displayForm(type: string, fab: FabContainer) {
    fab.close();
    if (type === "followup") {
      this.newfollowup.content = "";
      this.newfollowup.requesttypes_id = 0;
      this.newfollowup.is_private = false;
    } else if (type === "task") {
      this.newtask.content = "";
      this.newtask.users_id_tech = 0;
      this.newtask.groups_id_tech = 0;
    }
  }

  public addFollowup() {
    const input = {
      content: this.newfollowup.content,
      is_private: this.newfollowup.is_private,
      requesttypes_id: this.newfollowup.requesttypes_id,
      tickets_id: this.selectedItem.id,
    };
    this.httpService.saveItem("TicketFollowup", 0, input)
      .subscribe(function(data) {
        this.newfollowup.content = null;
        this.loadTimeline();
      }.bind(this));
  }

  public addTask() {
    const input = {
      content: this.newtask.content,
      groups_id_tech: this.newtask.groups_id_tech,
      tickets_id: this.selectedItem.id,
      users_id_tech: this.newtask.users_id_tech,
    };
    this.httpService.saveItem("TicketTask", 0, input)
      .subscribe(function(data) {
        this.newtask.content = null;
        this.loadTimeline();
      }.bind(this));
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

  private SetAllItemVisible() {
    for (const item of this.selectedItem) {
      this.hiddenItem[item] = false;
    }
  }
}
