import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GlpiService } from '../../services/glpi.service';

@Component({
  selector: 'app-deploydetails',
  templateUrl: './deploydetails.page.html',
  styleUrls: ['./deploydetails.page.scss'],
})
export class DeploydetailsPage implements OnInit {

  jobsId = null;
  status = {
    prepared: [],
    running: [],
    installed: [],
    error: []
  };
  status_total_counts = {
    prepared: 0,
    running: 0,
    installed: 0,
    error: 0
  };
  search_text = {
    prepared: '',
    running: '',
    installed: '',
    error: ''
  };
  agents_cache = {};

  constructor(private activatedRoute: ActivatedRoute, private glpi: GlpiService) {

  }

  ngOnInit() {
    this.jobsId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getComputerList();

  }

  getComputerList() {
    this.getPrepared();
    this.getRunning();
    this.getInstalled();
    this.getError();
  }

  getPrepared() {
    const fields = [6];

    const criteria = [
      {
        link: 'OR',
        field: 3,
        searchtype: 'equals',
        value: this.jobsId
      },
      {
        link: 'AND',
        field: 4,
        searchtype: 'equals',
        value: 0
      },
      {
        link: 'AND',
        field: 6,
        searchtype: 'contains',
        value: this.search_text.prepared
      },
      {
        link: 'AND',
        field: 7,
        searchtype: 'equals',
        value: 1
      },
    ];
    this.glpi.search('PluginFusioninventoryTaskjobstate', fields, criteria, '0-9')
      .subscribe(res => {
        this.status_total_counts.prepared = res.meta.totalcount;
        this.status.prepared = [];
        for (let data of res.data) {
          this.status.prepared.push({
            name: data['PluginFusioninventoryTaskjobstate__PluginFusioninventoryAgent__Computer__name']['value'],
            link: '',
            taskjobstates_id: data['PluginFusioninventoryTaskjobstate__id']['id']
          });
        }
      });
  }

  getRunning() {
    const fields = [6];

    const criteria = [
      {
        link: 'OR',
        field: 3,
        searchtype: 'equals',
        value: this.jobsId
      },
      {
        link: 'AND',
        field: 4,
        searchtype: 'equals',
        value: 1
      },
      {
        link: 'AND',
        field: 7,
        searchtype: 'equals',
        value: 1
      },
      {
        link: 'OR',
        field: 3,
        searchtype: 'equals',
        value: this.jobsId
      },
      {
        link: 'AND',
        field: 4,
        searchtype: 'equals',
        value: 2
      },
      {
        link: 'AND',
        field: 7,
        searchtype: 'equals',
        value: 1
      },
    ];
    this.glpi.search('PluginFusioninventoryTaskjobstate', fields, criteria, '0-9')
      .subscribe(res => {
        this.status_total_counts.running = res.meta.totalcount;
        for (let data of res.data) {
          let computer_name = '[deleted]';
          if ('PluginFusioninventoryTaskjobstate__PluginFusioninventoryAgent__Computer__name' in data) {
            computer_name = data['PluginFusioninventoryTaskjobstate__PluginFusioninventoryAgent__Computer__name']['value'];
          }
          this.status.running.push({
            name: computer_name,
            link: '',
            taskjobstates_id: data['PluginFusioninventoryTaskjobstate__id']['id']
          });
        }
      });
  }

  getInstalled() {
    const fields = [6];

    const criteria = [
      {
        link: 'OR',
        field: 3,
        searchtype: 'equals',
        value: this.jobsId
      },
      {
        link: 'AND',
        field: 4,
        searchtype: 'equals',
        value: 3
      },
      {
        link: 'AND',
        field: 7,
        searchtype: 'equals',
        value: 1
      },
    ];
    this.glpi.search('PluginFusioninventoryTaskjobstate', fields, criteria, '0-9')
      .subscribe(res => {
        this.status_total_counts.installed = res.meta.totalcount;
        let toto = 0;
        for (let data of res.data) {
          toto++;
          this.status.installed.push({
            name: data['PluginFusioninventoryTaskjobstate__PluginFusioninventoryAgent__Computer__name']['value'],
            link: '',
            taskjobstates_id: data['PluginFusioninventoryTaskjobstate__id']['id']
          });
        }
        console.log(toto);
      });
  }


  getError() {
    const fields = [6];

    const criteria = [
      {
        link: 'OR',
        field: 3,
        searchtype: 'equals',
        value: this.jobsId
      },
      {
        link: 'AND',
        field: 4,
        searchtype: 'equals',
        value: 4
      },
      {
        link: 'AND',
        field: 7,
        searchtype: 'equals',
        value: 1
      },
    ];
    this.glpi.search('PluginFusioninventoryTaskjobstate', fields, criteria, '0-9')
      .subscribe(res => {
        this.status_total_counts.error = res.meta.totalcount;
        for (let data of res.data) {
          this.status.error.push({
            name: data['PluginFusioninventoryTaskjobstate__PluginFusioninventoryAgent__Computer__name']['value'],
            link: '',
            taskjobstates_id: data['PluginFusioninventoryTaskjobstate__id']['id']
          });
        }
      });
  }
}
