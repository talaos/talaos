/**
 * Created by ddurieux on 2/4/17.
 */
import {Component} from "@angular/core";
import {BackendGlpiService} from "./backend.glpi.service";

@Component({
  providers: [BackendGlpiService],
  selector: "backend",
  template: `

  `,
})

export class BackendGlpiComponent {
  public getData: string;

  constructor(private httpService: BackendGlpiService) {}

  public onHostGet() {
    this.httpService.getAll("Computer")
      .subscribe(function(data) {
        this.getData = data;
        }.bind(this),
      );
  }
}
