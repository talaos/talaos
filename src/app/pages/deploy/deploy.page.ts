import { Component, OnInit } from '@angular/core';
import { GlpiService } from '../../services/glpi.service';
import { ModalController } from '@ionic/angular';
import { DeployModal } from '../../modals/forms/deploy/deploy.modal';

@Component({
  selector: 'app-deploy',
  templateUrl: './deploy.page.html',
  styleUrls: ['./deploy.page.scss'],
})
export class DeployPage implements OnInit {

  public tasks = [];
  search_text = "";

  constructor(private glpi: GlpiService, public modalController: ModalController) {

  }

  ngOnInit() {
    this.getTasks();
  }

  async presentForm() {
    const modal = await this.modalController.create({
      component: DeployModal,
      backdropDismiss: false,
      cssClass: "modal-fullscreen",
    });
    return await modal.present();
  }

  async editForm(id) {
    const modal = await this.modalController.create({
      component: DeployModal,
      id: id,
      backdropDismiss: false,
      cssClass: "modal-fullscreen",
    });
    return await modal.present();
  }

  getTasks() {
    this.tasks = [];

    // TODO use search PluginFusioninventoryTaskjob instead getItemsRestrict
    let fields = [2, 4, 5, 6, 7];
    let criteria = [
      {
        link: "OR",
        field: 6, 
        searchtype: "contains", 
        value: "deployinstall"
      },
    ];
    if (this.search_text != "") {
      criteria.push({
        link: "AND",
        field: 4,
        searchtype: "contains", 
        value: this.search_text
      });
    }
    this.glpi.search("PluginFusioninventoryTaskjob", fields, criteria, "0-50")
      .subscribe(res => {
        for(let data of res.data) {
          let myTask = {
            task_id: data.PluginFusioninventoryTaskjob__PluginFusioninventoryTask__id.value,
            taskjobs_id: data.PluginFusioninventoryTaskjob__id.value,
            name: data.PluginFusioninventoryTaskjob__PluginFusioninventoryTask__name.value,
            activated: data.PluginFusioninventoryTaskjob__PluginFusioninventoryTask__is_active.value,
            target: 0,
            status: {
              prepared: 0,
              running: 0,
              installed: 0,
              error: 0
            }
          };
          this.getTaskJobState(myTask);
        }
      });
  }

  getTaskJobState(myTask) {
    this.glpi.search("PluginFusioninventoryTaskjobstate", [], 
                     this.getSearchCriteriaPrepared(myTask.taskjobs_id), "0-1")
      .subscribe(res_prepared => {
        myTask.status.prepared = res_prepared.meta.totalcount;
        myTask.target += res_prepared.meta.totalcount;
        this.glpi.search("PluginFusioninventoryTaskjobstate", [], 
                  this.getSearchCriteriaRunning(myTask.taskjobs_id), "0-1")
          .subscribe(res_running => {
            myTask.status.running = res_running.meta.totalcount;
            myTask.target += res_running.meta.totalcount;
            this.glpi.search("PluginFusioninventoryTaskjobstate", [], 
                      this.getSearchCriteriaInstalled(myTask.taskjobs_id), "0-1")
              .subscribe(res_installed => {
                myTask.status.installed = res_installed.meta.totalcount;
                myTask.target += res_installed.meta.totalcount;
                this.glpi.search("PluginFusioninventoryTaskjobstate", [], 
                          this.getSearchCriteriaError(myTask.taskjobs_id), "0-1")
                  .subscribe(res_error => {
                    myTask.status.error = res_error.meta.totalcount;
                    myTask.target += res_error.meta.totalcount;
                    this.tasks.push(myTask);
                  });
                });
            });
        });
  }


  getSearchCriteriaPrepared(taskjobs_id) {
    return [
      {
        link: "OR",
        field: 3, 
        searchtype: "equals", 
        value: taskjobs_id
      },
      {
        link: "AND",
        field: 4, 
        searchtype: "equals", 
        value: 0
      },
      {
        link: "AND",
        field: 7, 
        searchtype: "equals", 
        value: 1
      },
    ];
  }

  getSearchCriteriaRunning(taskjobs_id) {
    return [
      {
        link: "OR",
        field: 3, 
        searchtype: "equals", 
        value: taskjobs_id
      },
      {
        link: "AND",
        field: 4, 
        searchtype: "equals", 
        value: 1
      },
      {
        link: "AND",
        field: 7, 
        searchtype: "equals", 
        value: 1
      },
      {
        link: "OR",
        field: 3, 
        searchtype: "equals", 
        value: taskjobs_id
      },
      {
        link: "AND",
        field: 4, 
        searchtype: "equals", 
        value: 2
      },
      {
        link: "AND",
        field: 7, 
        searchtype: "equals", 
        value: 1
      },
    ];
  }

  getSearchCriteriaInstalled(taskjobs_id) {
    return [
      {
        link: "OR",
        field: 3, 
        searchtype: "equals", 
        value: taskjobs_id
      },
      {
        link: "AND",
        field: 4,
        searchtype: "equals", 
        value: 3
      },
      {
        link: "AND",
        field: 7, 
        searchtype: "equals", 
        value: 1
      },
    ];
  }

  getSearchCriteriaError(taskjobs_id) {
    return [
      {
        link: "OR",
        field: 3, 
        searchtype: "equals", 
        value: taskjobs_id
      },
      {
        link: "AND",
        field: 4, 
        searchtype: "equals", 
        value: 4
      },
      {
        link: "AND",
        field: 7, 
        searchtype: "equals", 
        value: 1
      },
    ];
  }
}
