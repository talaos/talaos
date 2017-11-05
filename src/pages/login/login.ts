import { Component} from "@angular/core";
import { Events } from "ionic-angular";
import { BackendService } from "../../backend/backend.service";

@Component({
    providers: [ BackendService ],
    selector: "login",
    templateUrl: "login.html",
})
export class LoginPage {
    public glpiurl: string;
    public glpiurlf: string = ""; // http://theoule/glpi/apirest.php';
    public apptoken: string;
    public apptokenf: string = ""; // 'wmpjzyf2lrmlnjb4pvor30hoytlig618t8l19xxq';
    public username: string = "";
    public password: string = "";

    constructor(private httpService: BackendService, public events: Events) {
      this.ngOnInit();
    }

    public login() {
      if (this.glpiurlf !== "") {
        localStorage.setItem("glpiurl", this.glpiurlf);
      }
      if (this.apptokenf !== "") {
        localStorage.setItem("apptoken", this.apptokenf);
      }
      this.httpService.doLogin(this.username, this.password);

    }

    private ngOnInit() {
        let value: string = localStorage.getItem("session-token");
        if (value && value !== "undefined" && value !== "null") {
          this.events.publish("login:successful", "");
        }

        value = localStorage.getItem("glpiurl");
        if (value && value !== "undefined" && value !== "null") {
            this.glpiurl = value;
        }

        value = localStorage.getItem("apptoken");
        if (value && value !== "undefined" && value !== "null") {
            this.apptoken = value;
        }
    }
}
