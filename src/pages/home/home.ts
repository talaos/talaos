import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { GlobalVars } from "../../app/globalvars";
import { BackendService } from "../../backend/backend.service";
import { TicketPage } from "../ticket/ticket";

@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
  private glpiid = "glpiID";
  private username = "";

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

  private subscription: Subscription;

  constructor(public navCtrl: NavController, private globalVars: GlobalVars, private httpService: BackendService) {
    this.subscription = this.globalVars.getUsername().subscribe(username => {
      this.loadDashboard();
      this.username = username;
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

  private ngOnInit() {
    if (this.globalVars.session[this.glpiid] && this.globalVars.session[this.glpiid] !== "undefined") {
      this.loadDashboard();
    }
  }

  private loadDashboard() {
    this.ticketProcessingCriteria = [{field: 4, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
        {link: "AND", field: 12, searchtype: "equals", value: "notold"}];
    this.ticketLateCriteria = [{field: 4, searchtype: "equals", value: this.globalVars.session[this.glpiid]},
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
    this.httpService.search("Ticket", [1, 2, 80],
      this.ticketProcessingCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketProcessing = data.totalcount;
        if (this.ticketProcessing > 0) {
          this.ticketProcessingClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets exceedeed time to resolv
    this.httpService.search("Ticket", [1, 2, 80],
      this.ticketLateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketLate = data.totalcount;
        if (this.ticketLate > 0) {
          this.ticketLateClass = ["dashboard", "dashboard-danger"];
        }
      }.bind(this));

    // Tickets new...
    this.httpService.search("Ticket", [1, 2, 80],
      this.ticketNewCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketNew = data.totalcount;
        if (this.ticketNew > 0) {
          this.ticketNewClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to validate...
    this.httpService.search("TicketValidation", [1, 2, 80],
      this.ticketTovalidateCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTovalidate = data.totalcount;
        if (this.ticketTovalidate > 0) {
          this.ticketTovalidateClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to fill survey...
    this.httpService.search("Ticket", [1, 2, 80],
      this.ticketSatisfactionCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketSatisfaction = data.totalcount;
        if (this.ticketSatisfaction > 0) {
          this.ticketSatisfactionClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets task to do...
    this.httpService.search("Ticket", [1, 2, 80],
      this.ticketTasktodoCriteria, "0-1")
      .subscribe(function(data) {
        this.ticketTasktodo = data.totalcount;
        if (this.ticketTasktodo > 0) {
          this.ticketTasktodoClass = ["dashboard"];
        }
      }.bind(this));
  }

}
