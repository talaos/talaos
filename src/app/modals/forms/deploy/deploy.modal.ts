import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GlpiService } from '../../../services/glpi.service';

interface deployData {
    name: string;
    is_active: boolean,
    targets: Array<number>,
    actors: Array<number>,
    reprepare_if_successful: boolean
    comment: string,
    datetime_start: Date,
    datetime_end: Date,
    plugin_fusioninventory_timeslots_prep_id: number,
    plugin_fusioninventory_timeslots_exec_id: number,
    wakeup_agent_counter: number,
    wakeup_agent_time: number,
}
// wakeup_agent_counter | wakeup_agent_time
@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.modal.html',
  styleUrls: ['./deploy.modal.scss'],
})
export class DeployModal implements OnInit {

  public mydata: deployData;

  constructor(private modalCtrl:ModalController, private glpi: GlpiService) {
    
    this.mydata = {
      name: "",
      is_active: false,
      targets: [],
      actors: [],
      reprepare_if_successful: false,
      comment: "",
      datetime_start: null,
      datetime_end: null,
      plugin_fusioninventory_timeslots_prep_id: 0,
      plugin_fusioninventory_timeslots_exec_id: 0,
      wakeup_agent_counter: 0,
      wakeup_agent_time: 0,
    }
  }

  ngOnInit() {
    console.log(this.mydata);
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  save() {
    console.log(this.mydata);

    // create task
    let task_input = {
      name: this.mydata.name,
      entities_id: 0,
      comment: this.mydata.comment,
      is_active: this.mydata.is_active,
      datetime_start: this.mydata.datetime_start,
      datetime_end: this.mydata.datetime_end,
      plugin_fusioninventory_timeslots_prep_id: this.mydata.plugin_fusioninventory_timeslots_prep_id,
      plugin_fusioninventory_timeslots_exec_id: this.mydata.plugin_fusioninventory_timeslots_exec_id,
      wakeup_agent_counter: this.mydata.wakeup_agent_counter,
      wakeup_agent_time: this.mydata.wakeup_agent_time,
      reprepare_if_successful: this.mydata.reprepare_if_successful,
    }
    this.glpi.saveItem("PluginFusioninventoryTask", 0, task_input)
      .subscribe(res => {
        // create taskjob
        let taskjob_input = {
          name: this.mydata.name,
          entities_id: 0,
          plugin_fusioninventory_tasks_id: res["id"],
          method: "deployinstall",
          targets: "[]",
          actors: "[]",
        }
        this.glpi.saveItem("PluginFusioninventoryTaskjob", 0, taskjob_input)
          .subscribe();
    });




  }

}
