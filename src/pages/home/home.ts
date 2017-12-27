import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { GlobalVars } from "../../app/globalvars";
import { BackendService } from "../../backend/backend.service";

@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
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

  constructor(public navCtrl: NavController, private globalVars: GlobalVars, private httpService: BackendService) {
  }

  private ngOnInit() {
    // Tickets processing...
    this.httpService.search("Ticket", [1, 2, 80],
      [{field: 4, searchtype: "equals", value: this.globalVars.session["glpiID"]},
        {link: "AND", field: 12, searchtype: "equals", value: "notold"}], "0-1")
      .subscribe(function(data) {
        this.ticketProcessing = data.totalcount;
        if (this.ticketProcessing > 0) {
          this.ticketProcessingClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets exceedeed time to resolv
    this.httpService.search("Ticket", [1, 2, 80],
      [{field: 4, searchtype: "equals", value: this.globalVars.session["glpiID"]},
        {link: "AND", field: 12, searchtype: "equals", value: "notold"},
        {link: "AND", field: 82, searchtype: "equals", value: "1"}], "0-1")
      .subscribe(function(data) {
        this.ticketLate = data.totalcount;
        if (this.ticketLate > 0) {
          this.ticketLateClass = ["dashboard", "dashboard-danger"];
        }
      }.bind(this));

    // Tickets new...
    this.httpService.search("Ticket", [1, 2, 80],
      [{field: 12, searchtype: "equals", value: "1"}], "0-1")
      .subscribe(function(data) {
        this.ticketNew = data.totalcount;
        if (this.ticketNew > 0) {
          this.ticketNewClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to validate...
    this.httpService.search("TicketValidation", [1, 2, 80],
      [{field: 7, searchtype: "equals", value: this.globalVars.session["glpiID"]}], "0-1")
      .subscribe(function(data) {
        this.ticketTovalidate = data.totalcount;
        if (this.ticketTovalidate > 0) {
          this.ticketTovalidateClass = ["dashboard"];
        }
      }.bind(this));

    // Tickets to fill survey...

    // Tickets task to do...
    this.httpService.search("Ticket", [1, 2, 80],
      [{field: 95, searchtype: "equals", value: this.globalVars.session["glpiID"]},
        {link: "AND", field: 12, searchtype: "equals", value: "notold"},
        {link: "AND", field: 33, searchtype: "equals", value: "1"}], "0-1")
      .subscribe(function(data) {
        this.ticketTasktodo = data.totalcount;
        if (this.ticketTasktodo > 0) {
          this.ticketTasktodoClass = ["dashboard"];
        }
      }.bind(this));
  }
}
