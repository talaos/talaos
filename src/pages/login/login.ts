import { Component} from "@angular/core";
import { App, Config, Events, FabContainer } from "ionic-angular";
import { BackendGlpiService } from "../../backends/backend.glpi.service";
import { HomePage } from "../../pages/home/home";

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
    public display: boolean = false;

    public connections;
    public types = [];

    constructor(private httpGlpiService: BackendGlpiService, public events: Events,
                public appCtrl: App, public config: Config) {
      this.types = [
        {value: "glpi", viewValue: "Glpi"},
      ];
      this.connections = [];
    }

  /**
   * Run the login
   */
  public login() {
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
        .subscribe((data) => {},
          (error) => {},
          () => {
            this.establishConnections();
          });
      i++;
    }
    this.httpGlpiService.connections = [];
    this.httpGlpiService.loadConnections();
    this.establishConnections();
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
   * Try establish connection with backends (API REST)
   */
  public establishConnections() {
    for (const connection of this.httpGlpiService.connections) {
      this.httpGlpiService.getFullSession()
        .subscribe(function(data) {
          if (data.session.glpiID !== undefined) {
            connection.established = true;
            connection.session = data.session;
          } else {
            connection.session_token = "";
            connection.try++;
          }
        }.bind(this),
        (error) => {
          connection.try++;
          connection.session_token = "";
          this.config.set("connections_glpi", this.httpGlpiService.connections);
          this.checkConnections();
        },
        function() {
          this.config.set("connections_glpi", this.httpGlpiService.connections);
          this.checkConnections();
        }.bind(this));
    }
  }

  /**
   * Check if all connections are established
   */
  public checkConnections() {
    console.log("Check connections....");
    let allConnections = 0;
    let successConnections = 0;
    let failedConnections = 0;
    for (const connection of this.httpGlpiService.connections) {
      allConnections++;
      if (connection.established) {
        successConnections++;
      } else if (connection.try > 0) {
        this.connections.push(connection);
        failedConnections++;
      }
    }

    if (allConnections > 0
      && allConnections === successConnections) {
      // Go to homepage
      this.appCtrl.getRootNav().setRoot(HomePage);
    } else {
      // display login page
      console.log("DISPLAY");
      this.display = true;
    }
  }

  /**
   * Load connections in the localstorage
   */
  private ngOnInit() {
    this.establishConnections();
  }
}
