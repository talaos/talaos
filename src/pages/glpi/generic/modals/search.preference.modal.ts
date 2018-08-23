// https://github.com/ionic-team/ionic/blob/v3/demos/src/item-reorder/
import { Component} from "@angular/core";
import { NavParams, reorderArray, ViewController } from "ionic-angular";
import { GlobalVars } from "../../../../app/globalvars";
import { BackendGlpiService } from "../../../../backends/backend.glpi.service";

@Component({
  providers: [ BackendGlpiService ],
  templateUrl: "search.preference.modalhtml",
})
export class SearchPreferenceModal {
  public itemtype;
  public mysearch;
  public fields;
  public allColumns = [];

  constructor(private httpService: BackendGlpiService, public params: NavParams, public viewCtrl: ViewController,
              private globalVars: GlobalVars) {
    this.itemtype = this.params.get("itemtype");
  }

  public ngOnInit() {
    this.getAllColumns();
  }

  /**
   * Get all columns from list search options of the itemtype
   */
  public getAllColumns() {
    this.httpService.getListSearchOptions(this.itemtype)
      .subscribe((options) => {
        for (const index of Object.keys(options)) {
          this.allColumns.push(options[index]);
        }
        // this.getUserColumns();
        this.getGlobalColumns();
      });
  }

  public getUserColumns() {
    const where = {
      itemtype: "^" + this.itemtype + "$",
      users_id: "^" + this.globalVars.session["glpiID"] + "$",
    };
    // Get preferences of this user
    this.httpService.getItemsRestrict("DisplayPreference", where)
      .subscribe((data) => {
        // TODO Do same that next function
      });
  }

  public getGlobalColumns() {
    const where = {
      itemtype: "^" + this.itemtype + "$",
      users_id: "^0$",
    };
    // Get preferences of global
    this.httpService.getItemsRestrict("DisplayPreference", where)
      .subscribe((data) => {
        for (const item of Object.keys(data.data)) {
          for (const columns of this.allColumns) {
            if (+columns.id === data.data[item].num) {
              columns.enabled = true;
              columns.preferenceID = data.data[item].id;
              break;
            }
          }
        }
        this.reorderByEnabled();
      });
  }

  public reorderData(indexes: any) {
    this.allColumns = reorderArray(this.allColumns, indexes);
    this.reorderByEnabled();
  }

  public reorderByEnabled() {
    const enabled = [];
    const disabled = [];
    for (const item of this.allColumns) {
      if (item.enabled) {
        enabled.push(item);
      } else {
        disabled.push(item);
      }
    }
    this.allColumns = [...enabled, ...disabled];
  }

  public updatePreferences() {
    this.reorderByEnabled();

    // Write in API
    let num = 1;
    for (const item of this.allColumns) {
      if (!item.enabled) {
        if (item.preferenceID !== undefined) {
          this.httpService.deleteItem("DisplayPreference", item.preferenceID)
            .subscribe();
        }
      } else {
        // Update rank of old
        if (item.preferenceID !== undefined) {
          this.httpService.saveItem("DisplayPreference", item.preferenceID, {
            rank: num,
          })
            .subscribe();
        } else {
          // add new
          this.httpService.saveItem("DisplayPreference", 0, {
            itemtype: this.itemtype,
            num: item.id,
            rank: num,
            users_id: 0,
          })
            .subscribe((data) => {
              this.httpService.saveItem("DisplayPreference", data["id"], {
                rank: num,
              })
                .subscribe();
            });
        }
      }
      num++;
    }
  }

  public CloseModal() {
    this.viewCtrl.dismiss();
  }

}
