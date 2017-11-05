/**
 * Created by ddurieux on 2/4/17.
 */
import {Component} from "@angular/core";
import {BackendService} from "./backend.service";

@Component({
  providers: [BackendService],
  selector: "backend",
  template: `

  `,
})

export class BackendComponent {
  public getData: string;

  constructor(private httpService: BackendService) {}

  public onHostGet() {
    this.httpService.getAll("Computer")
      .subscribe(function(data) {
        this.getData = data;
        }.bind(this),
      );
  }
}
