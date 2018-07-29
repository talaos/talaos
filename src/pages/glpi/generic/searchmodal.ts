import { Component} from "@angular/core";
import { NavParams, ViewController } from "ionic-angular";
import { BackendGlpiService } from "../../../backends/backend.glpi.service";

@Component({
    providers: [ BackendGlpiService ],
    templateUrl: "searchmodal.html",
})
export class Searchmodal {
  public itemtype;
  public mysearch;
  public fields;

  constructor(private httpService: BackendGlpiService, public params: NavParams, public viewCtrl: ViewController) {
    this.itemtype = this.params.get("itemtype");
    this.mysearch = {
      blocks: [
        {
          blocks: [
            {
              field: 1,
              searchtype: "contains",
              value: "",
            },
          ],
          level: 2,
          operator: "and",
        },
      ],
      level: 1,
      operator: "and",
    };
    this.getFields();
  }

  public addLevel1() {
    this.mysearch.blocks.push({
      blocks: [
        {
          field: 1,
          searchtype: "contains",
          value: "",
        },
      ],
      level: 2,
      operator: "and",
    });
  }

  public addLevel2(data) {
    data.blocks.push({
        field: 1,
        searchtype: "contains",
        value: "",
      },
    );
  }

  public CloseModal() {
    // TODO : prepare search request to GLPI style (so need convert modal search to GLPI search type)
    const data = this.convertToGLPIType();
    this.viewCtrl.dismiss(data);
  }

  public loadSearchtypes(fieldId) {
    /*
    let allsearchtypes = {
      contains: "contient",
      equals: "est",
      notequals: "nest pas"
    };

    for (let soption of this.fields) {
      if (soption.id != undefined) {
        if (soption.id === field_id) {
          return [{name: "cont", translate: "cont_a"}];
        }
      }
    }
    */
    return [];
  }

  public parseListOptions(data) {
    this.fields = data;
  }

  public getFields() {
    this.httpService.getListSearchOptions("Ticket")
      .subscribe(function(data) {
          this.parseListOptions(data);
        }.bind(this),
        function(error) {
          this.httpService.manageError(error);
        }.bind(this),
      );
  }

  /*
  Cases convert to GLPI search type:

  AND
       OR
           lieu contain titi
           lieu contain toto

       AND
           statut en cours
           statut nouveau

  =>
  statut en cours
  AND statut nouveau
  AND lieu contain titi
  OR statut en cours
  AND statut nouveau
  AND lieu contain toto

  =======================================

  AND
       OR
           lieu contain titi
           lieu contain toto

       OR
           statut en cours
           statut nouveau

  =>
  statut en cours
  AND lieu contain titi
  OR statut en cours
  AND lieu contain toto
  OR statut nouveau
  AND lieu contain titi
  OR statut nouveau
  AND lieu contain toto

  =======================================

  OR
       OR
           lieu contain titi
           lieu contain toto

       AND
           statut en cours
           statut nouveau

  =>
  statut en cours
  AND statut nouveau
  OR lieu contain titi
  OR lieu contain toto

  */
  private managetheor(data, myblock) {
    const newdata = [];
    for (const block of myblock) {
      for (const mdata of data) {
        mdata.push(block);
        newdata.push(mdata);
      }
      if (data.length === 0) {
        newdata.push([block]);
      }
    }
    return newdata;
  }

  private convertToGLPIType() {
    const criteria = [];
    const forcedisplay = [];
    // manage the and (level1)
    if (this.mysearch.operator === "and") {
      // manage the and (level2)
      const andcrit = [];
      for (const blockv1 of this.mysearch.blocks) {
        if (blockv1.operator === "and") {
          for (const blockv2 of blockv1.blocks) {
            andcrit.push({link: "and", field: blockv2.field, searchtype: blockv2.searchtype, value: blockv2.value});
          }
        }
      }
      // manage the or (level2)
      let orcrit = [];
      for (const blockv1 of this.mysearch.blocks) {
        if (blockv1.operator === "or") {
          const myblock = [];
          for (const blockv2 of blockv1.blocks) {
            myblock.push({
              field: blockv2.field,
              link: "and",
              searchtype: blockv2.searchtype,
              value: blockv2.value,
            });
          }
          orcrit = this.managetheor(orcrit, myblock);
        }
      }
      let i = 0;
      for (const mycrit of orcrit) {
        for (const mycrit2 of mycrit) {
          if (i === 0) {
            mycrit2.link = "or";
          }
          i = i + 1;
          criteria.push(mycrit2);
        }
        for (const mycrit3 of andcrit) {
          criteria.push(mycrit3);
        }
      }
    } else if (this.mysearch.operator === "or") {
      let i = 0;
      for (const blockv1 of this.mysearch.blocks) {
        let j = 0;
        for (const blockv2 of blockv1.blocks) {
          if (i > 0) {
            if (j === 0) {
              criteria.push({
                field: blockv2.field,
                link: this.mysearch.operator,
                searchtype: blockv2.searchtype,
                value: blockv2.value,
              });
            } else {
              criteria.push({
                field: blockv2.field,
                link: blockv1.operator,
                searchtype: blockv2.searchtype,
                value: blockv2.value,
              });
            }
          } else {
            criteria.push({field: blockv2.field, searchtype: blockv2.searchtype, value: blockv2.value});
          }
          i = i + 1;
          j = j + 1;
        }
      }
    }

    for (const blockv1 of this.mysearch.blocks) {
      for (const blockv2 of blockv1.blocks) {
        criteria.push({
          field: blockv2.field,
          searchtype: blockv2.searchtype,
          value: blockv2.value,
        });
        forcedisplay.push(blockv2.field);
      }
    }
    return {
      criteria,
      forcedisplay,
    };
  }

}
