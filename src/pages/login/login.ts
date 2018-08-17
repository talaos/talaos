import { Component} from "@angular/core";
import {Events, FabContainer} from "ionic-angular";
import { GlobalVars } from "../../app/globalvars";
import { BackendGlpiService } from "../../backends/backend.glpi.service";

@Component({
    providers: [ BackendGlpiService ],
    selector: "login",
    templateUrl: "login.html",
})

export class LoginPage {
    public glpiurl: string;
    public glpiurlf: string = "http://127.0.0.1/glpi090/apirest.php"; // "http://theoule/glpi/apirest.php";
    public apptoken: string;
    public apptokenf: string = "";
    public username: string = "";
    public password: string = "";

    public connections;
    public types = [];

    constructor(private httpGlpiService: BackendGlpiService, private globalVars: GlobalVars, public events: Events) {
      this.types = [
        {value: "glpi", viewValue: "Glpi"},
      ];
      this.connections = [];
    }

  /**
   * Run the login
   */
  public login() {
    this.globalVars.numberConnections = this.connections.length;

    // register in local storage
    localStorage.setItem("number_connections", this.connections.length);

    let i = 0;
    for (const connection of this.connections) {
      localStorage.setItem("connection_" + i + "_name", connection.name);
      localStorage.setItem("connection_" + i + "_app_token", connection.app_token);
      localStorage.setItem("connection_" + i + "_type", connection.type);
      localStorage.setItem("connection_" + i + "_username", connection.username);
      localStorage.setItem("connection_" + i + "_url", connection.url);

      this.httpGlpiService.doLogin(connection.username, connection.password, i)
        .subscribe((data) => data);
      i++;
    }
  }

  /**
   * Add a new connection
   */
    public addConnection(type: string, fab: FabContainer) {
      fab.close();
      if (type === "glpi") {
        this.connections.push({app_token: "", display_options: true, name: "", password: "",
          session_token: "", type: "glpi", url: "http://127.0.0.1/glpi090/apirest.php", username: ""});
      }
    }

  /**
   * show / hide connection options
   */
  public toggleOptions(myconnection) {
      myconnection.display_options = !myconnection.display_options;
    }

  /**
   * Load connections in the localstorage
   */
  private ngOnInit() {
    const numberConnections = Number(localStorage.getItem("number_connections"));
    this.globalVars.numberConnections = numberConnections;
    let i = 0;
    while (i < numberConnections) {
      if (localStorage.getItem("connection_" + i + "_name")) {
        let displayOptions = true;
        if (localStorage.getItem("connection_" + i + "_app_token")
          && localStorage.getItem("connection_" + i + "_url")) {

          displayOptions = false;
        }

        this.connections.push({
          app_token: localStorage.getItem("connection_" + i + "_app_token"),
          display_options: displayOptions,
          name: localStorage.getItem("connection_" + i + "_name"),
          password: "",
          session_token: localStorage.getItem("connection_" + i + "_session_token"),
          type: localStorage.getItem("connection_" + i + "_type"),
          url: localStorage.getItem("connection_" + i + "_url"),
          username: localStorage.getItem("connection_" + i + "_username"),
        });
        if (localStorage.getItem("connection_" + i + "_session_token") !== "") {
          this.events.publish("login:successful", "");

        }
      }
      i++;
    }
  }

}
