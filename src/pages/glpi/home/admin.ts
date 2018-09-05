import { Component } from "@angular/core";
import { Config, NavController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { SearchPage } from "../generic/searchlist";
import { TicketForm } from "../ticket/ticket_form";

@Component({
  providers: [ BackendGlpiService ],
  selector: "glpi-dashboard-admin",
  templateUrl: "admin.html",
})
export class GlpiHomeAdminPage {
  private glpiid = "glpiID";
  private username = "";
  private interfacetype = "";
  private dashboard = "";

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

  constructor(public navCtrl: NavController, private httpGlpiService: BackendGlpiService, public config: Config) {
    this.dashboard = this.config.get("glpi_dashboard");
  }

  public goTicketList(type) {
    if (type === "ticketProcessing") {
      this.navCtrl.push(SearchPage, {
        criteria: this.ticketProcessingCriteria,
        itemtype: "Ticket",
      });
    } else if (type === "ticketLate") {
      this.navCtrl.push(SearchPage, {
        criteria: this.ticketLateCriteria,
        itemtype: "Ticket",
      });
    } else if (type === "ticketNew") {
      this.navCtrl.push(SearchPage, {
        criteria: this.ticketNewCriteria,
        itemtype: "Ticket",
      });
    } else if (type === "ticketTovalidate") {
      this.navCtrl.push(SearchPage, {
        criteria: [{field: 59, searchtype: "equals", value: this.httpGlpiService.getSessionValue("glpiID")},
          {link: "AND", field: 55, searchtype: "equals", value: "2"},
          {link: "AND", field: 52, searchtype: "equals", value: "2"}],
        itemtype: "Ticket",
      });
    } else if (type === "ticketSatisfaction") {
      this.navCtrl.push(SearchPage, {
        criteria: this.ticketSatisfactionCriteria,
        itemtype: "Ticket",
      });
    } else if (type === "ticketTasktodo") {
      this.navCtrl.push(SearchPage, {
        criteria: this.ticketTasktodoCriteria,
        itemtype: "Ticket",
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

  public ngOnInit() {
    this.username = this.httpGlpiService.getSessionValue("username");
    this.interfacetype = this.httpGlpiService.getSessionValue("interface");
    if (this.interfacetype === "central") {
      this.loadDashboard();
    }
  }

  private loadDashboard() {
    const glpiID = this.httpGlpiService.getSessionValue("glpiID");
    this.ticketProcessingCriteria = [{field: 4, searchtype: "equals", value: glpiID},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"}];
    this.ticketLateCriteria = [{field: 5, searchtype: "equals", value: glpiID},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"},
      {link: "AND", field: 82, searchtype: "equals", value: "1"}];
    this.ticketNewCriteria = [{field: 12, searchtype: "equals", value: "1"}];
    this.ticketTovalidateCriteria = [{field: 7, searchtype: "equals", value: glpiID}];
    this.ticketSatisfactionCriteria = [{field: 12, searchtype: "equals", value: "6"},
      {link: "AND", field: 60, searchtype: "contains", value: "^"},
      {link: "AND", field: 61, searchtype: "contains", value: "NULL"},
      {link: "AND", field: 22, searchtype: "equals", value: glpiID}];
    this.ticketTasktodoCriteria = [{field: 95, searchtype: "equals", value: glpiID},
      {link: "AND", field: 12, searchtype: "equals", value: "notold"},
      {link: "AND", field: 33, searchtype: "equals", value: "1"}];

    // Tickets processing...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketProcessingCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketProcessing = data.meta.totalcount;
        if (this.ticketProcessing > 0) {
          this.ticketProcessingClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets exceedeed time to resolv
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketLateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketLate = data.meta.totalcount;
        if (this.ticketLate > 0) {
          this.ticketLateClass = ["dashboard", "dashboard-danger"];
        }
      }.bind(this));

    // Tickets new...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketNewCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketNew = data.meta.totalcount;
        if (this.ticketNew > 0) {
          this.ticketNewClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to validate...
    this.httpGlpiService.search("TicketValidation", [1, 2, 80],
      this.ticketTovalidateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTovalidate = data.meta.totalcount;
        if (this.ticketTovalidate > 0) {
          this.ticketTovalidateClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to fill survey...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketSatisfactionCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketSatisfaction = data.meta.totalcount;
        if (this.ticketSatisfaction > 0) {
          this.ticketSatisfactionClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets task to do...
    this.httpGlpiService.search("Ticket", [1, 2, 80],
      this.ticketTasktodoCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTasktodo = data.meta.totalcount;
        if (this.ticketTasktodo > 0) {
          this.ticketTasktodoClass = ["dashboard"];
        }
      }.bind(this));
  }
}
