import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";
import { TicketPage } from "../../glpi/ticket/ticket";
import {TicketForm} from "../../glpi/ticket/ticket_form";

@Component({
  providers: [ BackendGlpiService ],
  selector: "glpi-dashboard-enduser",
  templateUrl: "end-user.html",
})
export class GlpiHomeEnduserPage {
  private glpiid = "glpiID";
  private username = "helpdesk";
  private interfacetype = "";

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

  constructor(public navCtrl: NavController, private httpGlpiService: BackendGlpiService) {
  }

  public goTicketList(type) {
    const glpiID = this.httpGlpiService.getSessionValue("glpiID");

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
        criteria: [{field: 59, searchtype: "equals", value: glpiID},
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
    this.username = this.httpGlpiService.getSessionValue("username");
    this.interfacetype = this.httpGlpiService.getSessionValue("interface");
    if (this.interfacetype === "helpdesk") {
      this.loadDashboardEnduser();
    }
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
