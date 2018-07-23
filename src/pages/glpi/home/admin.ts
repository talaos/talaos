import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { GlobalVars } from "../../../app/globalvars";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { TicketPage } from "../../glpi/ticket/ticket";
import { TicketForm } from "../../glpi/ticket/ticket_form";

@Component({
  selector: "glpi-dashboard-admin",
  templateUrl: "admin.html",
})
export class GlpiHomeAdminPage {
  private glpiid = "glpiID";
  private username = "helpdesk";
  private interfacetype = "helpdesk";

  private ticketProcessing = 0;
  private ticketLate = 0;
  private ticketNew = 0;
  private ticketTovalidate = 0;
  private ticketSatisfaction = 0;
  private ticketTasktodo = 0;

  private ticketProcessingClass = ["dashboard", "dashboard-disabled"];
  private ticketLateClass = ["dashboard", "dashboard-disabled"];
  private ticketNewClass = ["dashboard", "dashboard-disabled"];
  private ticketTovalidateClass = ["dashboard", "dashboard-disabled"];
  private ticketSatisfactionClass = ["dashboard", "dashboard-disabled"];
  private ticketTasktodoClass = ["dashboard", "dashboard-disabled"];

  private ticketProcessingCriteria = [];
  private ticketLateCriteria = [];
  private ticketNewCriteria = [];
  private ticketTovalidateCriteria = [];
  private ticketSatisfactionCriteria = [];
  private ticketTasktodoCriteria = [];

  private ticketAll = [];

  private subscription: Subscription;

  constructor(public navCtrl: NavController, private globalVars: GlobalVars,
              private httpGlpiService: BackendGlpiService) {
    this.subscription = this.globalVars.getUsername().subscribe((username) => {
      this.username = username;
      this.subscription = this.globalVars.getInterfacetype().subscribe((interfacetype) => {
        this.interfacetype = interfacetype;
        if (this.interfacetype === "central") {
          this.loadDashboardCentral();
        } else if (this.interfacetype === "helpdesk") {
          this.loadDashboardEnduser();
        }
      });
    });
  }

  public goTicketList(type) {
    if (type === "ticketProcessing") {
      this.navCtrl.push(TicketPage, {
        criteria: this.ticketProcessingCriteria,
      });
    } else if (type === "ticketLate") {
      this.navCtrl.push(TicketPage, {
        criteria: this.ticketLateCriteria,
      });
    } else if (type === "ticketNew") {
      this.navCtrl.push(TicketPage, {
        criteria: this.ticketNewCriteria,
      });
    } else if (type === "ticketTovalidate") {
      this.navCtrl.push(TicketPage, {
        criteria: [{field: 59, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
          {link: "AND", field: 55, searchtype: "equals", value: "2"},
          {link: "AND", field: 52, searchtype: "equals", value: "2"}],
      });
    } else if (type === "ticketSatisfaction") {
      this.navCtrl.push(TicketPage, {
        criteria: this.ticketSatisfactionCriteria,
      });
    } else if (type === "ticketTasktodo") {
      this.navCtrl.push(TicketPage, {
        criteria: this.ticketTasktodoCriteria,
      });
    }
  }

  public goTicketForm(ticketsId) {
    if (ticketsId === undefined) {
      ticketsId = 0;
    }
    const item = {id: ticketsId};

    // That's right, we're pushing to ourselves!
    this.navCtrl.push(TicketForm, {
      item,
    });
  }

  private ngOnInit() {
    if (this.globalVars.session[this.glpiid] && this.globalVars.session[this.glpiid] !== "undefined") {
      if (this.interfacetype === "central") {
        this.loadDashboardCentral();
      } else if (this.interfacetype === "helpdesk") {
        this.loadDashboardEnduser();
      }
    }
  }

  private loadDashboardCentral() {
    this.ticketProcessingCriteria = [{field: 4, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"}];
    this.ticketLateCriteria = [{field: 5, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"},
      {link: "AND", field: 82, searchtype: "equals", value: "1"}];
    this.ticketNewCriteria = [{field: 12, searchtype: "equals", value: "1"}];
    this.ticketTovalidateCriteria = [{field: 7, searchtype: "equals", value: this.globalVars.session[this.glpiid]}];
    this.ticketSatisfactionCriteria = [{field: 12, searchtype: "equals", value: "6"},
      {link: "AND", field: 60, searchtype: "contains", value: "^"},
      {link: "AND", field: 61, searchtype: "contains", value: "NULL"},
      {link: "AND", field: 22, searchtype: "equals", value: this.globalVars.session[this.glpiid]}];
    this.ticketTasktodoCriteria = [{field: 95, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"},
      {link: "AND", field: 33, searchtype: "equals", value: "1"}];

    // Tickets processing...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketProcessingCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketProcessing = data.totalcount;
        if (this.ticketProcessing > 0) {
          this.ticketProcessingClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets exceedeed time to resolv
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketLateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketLate = data.totalcount;
        if (this.ticketLate > 0) {
          this.ticketLateClass = ["dashboard", "dashboard-danger"];
        }
      }.bind(this));

    // Tickets new...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketNewCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketNew = data.totalcount;
        if (this.ticketNew > 0) {
          this.ticketNewClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to validate...
    this.httpGlpiService.search("TicketValidation", [1, 2, 80],
      this.ticketTovalidateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTovalidate = data.totalcount;
        if (this.ticketTovalidate > 0) {
          this.ticketTovalidateClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to fill survey...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketSatisfactionCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketSatisfaction = data.totalcount;
        if (this.ticketSatisfaction > 0) {
          this.ticketSatisfactionClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets task to do...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketTasktodoCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTasktodo = data.totalcount;
        if (this.ticketTasktodo > 0) {
          this.ticketTasktodoClass = ["dashboard"];
        }
      }.bind(this));
  }

  private loadDashboardEnduser() {
    const criteria = [{field: 12, searchtype: "equals", value: "all"}];
    this.httpGlpiService.search("Ticket", [1, 2, 3, 12, 14, 15, 19, 80],
      // 1 = name, 2 = id, 12 = status, 3 = priority, 19 = last update, 80 = entity, 14 = type, 15 = opened date
      criteria, "0-20")
      .subscribe(function(data) {
        for (let mydata of data.data) {
          // Manage card color depend on status
          if (mydata[12] === 5) {
            mydata[12] = "closed";
          } else if (mydata[12] === 6) {
            mydata[12] = "closed";
          } else if (mydata[12] === 4) {
            mydata[12] = "waiting";
          } else {
            mydata[12] = "opened";
          }
          // Manage the type of ticket
          if (mydata[14] === 1) {
            mydata[14] = "ambulance";
          } else if (mydata[14] === 2) {
            mydata[14] = "paper-plane";
          }
          mydata[3] = Array(mydata[3]).fill(1);
          this.ticketAll.push(mydata);
        }
      }.bind(this));
  }

}
