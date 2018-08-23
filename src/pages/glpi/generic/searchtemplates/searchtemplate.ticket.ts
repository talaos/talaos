import {Component, Input, TemplateRef, ViewChild} from "@angular/core";
import {NavController} from "ionic-angular";
import {TicketForm} from "../../ticket/ticket_form";

@Component({
  selector: "searchtemplate-ticket",
  template: `
    <ng-template #Ticket__status let-row="row" let-value="value" let-i="index">
      <div [ngSwitch]="value">
        <div *ngSwitchCase="1">New</div>
        <div *ngSwitchCase="2">Assigned</div>
        <div *ngSwitchCase="3">Planned</div>
        <div *ngSwitchCase="4">Waiting</div>
        <div *ngSwitchCase="5">Solved</div>
        <div *ngSwitchCase="6">Closed</div>
      </div>
    </ng-template>

    <ng-template #Ticket__type let-row="row" let-value="value" let-i="index">
      <div *ngIf="value == 1">
        <button ion-button item-end icon-start clear>
          <i style="font-size: 20px;" class="fas fa-ambulance"></i>
          <br><span class="type-selected">incident</span>
        </button>
      </div>
      <div *ngIf="value == 2">
        <button ion-button item-end icon-start clear>
          <i style="font-size: 20px;" class="fas fa-paper-plane"></i>
          <br><span class="type-selected">demande</span>
        </button>
      </div>
    </ng-template>

    <ng-template #Ticket__priority let-row="row" let-value="value" let-i="index">
      <div *ngIf="value == 1">
        <i item-end style="font-size: 18px;" class="fas fa-seedling priority"></i>
        <i *ngFor="let i of [1, 2, 3, 4]" item-end style="font-size: 18px;" class="fas fa-seedling priority-disabled">
        </i>
      </div>
      <div *ngIf="value == 2">
        <i *ngFor="let i of [1, 2]" item-end style="font-size: 18px;" class="fas fa-seedling priority"></i>
        <i *ngFor="let i of [1, 2, 3]" item-end style="font-size: 18px;" class="fas fa-seedling priority-disabled"></i>
      </div>
      <div *ngIf="value == 3">
        <i *ngFor="let i of [1, 2, 3]" item-end style="font-size: 18px;" class="fas fa-seedling priority"></i>
        <i *ngFor="let i of [1, 2]" item-end style="font-size: 18px;" class="fas fa-seedling priority-disabled"></i>
      </div>
      <div *ngIf="value == 4">
        <i *ngFor="let i of [1, 2, 3, 4]" item-end style="font-size: 18px;" class="fas fa-seedling priority"></i>
        <i item-end style="font-size: 18px;" class="fas fa-seedling priority-disabled"></i>
      </div>
      <div *ngIf="value == 5">
        <i *ngFor="let i of [1, 2, 3, 4, 5]" item-end style="font-size: 18px;" class="fas fa-seedling priority"></i>
      </div>
    </ng-template>

    <ng-template #Ticket__name let-row="row" let-value="value" let-i="index">
       <button ion-button icon-left clear item-end (click)="goForm(row.ID)">
        {{value}}
      </button>
    </ng-template>
  `,
})
export class SearchTemplateTicket {
  @ViewChild("Ticket__status")
    public Ticket__status: TemplateRef<any>;
  @ViewChild("Ticket__type")
    public Ticket__type: TemplateRef<any>;
  @ViewChild("Ticket__priority")
    public Ticket__priority: TemplateRef<any>;
  @ViewChild("Ticket__priority")
    public Ticket__urgency: TemplateRef<any>;
  @ViewChild("Ticket__priority")
    public Ticket__impact: TemplateRef<any>;
  @ViewChild("Ticket__name")
    public Ticket__name: TemplateRef<any>;

  constructor(public navCtrl: NavController) {}

  public goForm(itemId) {
    if (itemId === undefined) {
      itemId = 0;
    }
    const item = {id: itemId};

    // That's right, we're pushing to ourselves!
    this.navCtrl.push(TicketForm, {
      item,
    });
  }

}
