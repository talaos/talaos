import { Component, OnInit } from '@angular/core';
import { GlpiService } from '../../../services/glpi.service';

@Component({
  selector: 'app-incident',
  templateUrl: './incident.page.html',
  styleUrls: ['./incident.page.scss'],
})
export class IncidentPage implements OnInit {

  public tickets = [];
  public internalBookmarkCounters = {
    mytickets: 0,
    newtickets: 0,
    grouptickets: 0,
    latetickets: 0,
    duedate4h: 0,
    duedate24h: 0,
    waiting: 0,
  };
  public bookmarkLoaded = 'mytickets';

  constructor(private glpi: GlpiService) {
    this.tickets = [];
  }

  ngOnInit() {
    this.getInternalBookmarkCounters();
    this.getTickets();
  }

  getTickets() {

    this.glpi.search('Ticket', [1, 2, 80], [], '0-20')
      .subscribe(res => {
        console.log(res);

      });
  }

  getInternalBookmarkCriteria(type) {
    let criteria = [];
    switch (type) {
      case 'mytickets':
        criteria.push({
          link: 'AND',
          field: 5,
          searchtype: 'equals',
          value: 22496
        });
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 'notold'
        });
        break;

      case 'newtickets':
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 1
        });
        break;

      case 'grouptickets':

        break;

      case 'latetickets':
        criteria.push({
          link: 'AND',
          field: 82,
          searchtype: 'equals',
          value: 1
        });
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 'notold'
        });
        break;

      case 'duedate4h':
        criteria.push({
          link: 'AND',
          field: 82,
          searchtype: 'equals',
          value: 0
        });
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 'notold'
        });
        criteria.push({
          link: 'AND',
          field: 18,
          searchtype: 'morethan',
          value: 'NOW'
        });
        criteria.push({
          link: 'AND',
          field: 18,
          searchtype: 'lessthan',
          value: '4HOUR'
        });
        break;

      case 'duedate24h':
        criteria.push({
          link: 'AND',
          field: 82,
          searchtype: 'equals',
          value: 0
        });
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 'notold'
        });
        criteria.push({
          link: 'AND',
          field: 18,
          searchtype: 'morethan',
          value: 'NOW'
        });
        criteria.push({
          link: 'AND',
          field: 18,
          searchtype: 'lessthan',
          value: '24HOUR'
        });
        break;

      case 'waiting':
        criteria.push({
          link: 'AND',
          field: 12,
          searchtype: 'equals',
          value: 4
        });
        break;
    }
    return criteria;
  }

  getInternalBookmarkCounters() {
    for (let bmkc in this.internalBookmarkCounters) {
      let criteria = this.getInternalBookmarkCriteria(bmkc);
      this.glpi.search('Ticket', [1, 2, 80], criteria, '0-1')
        .subscribe(res => {
          this.internalBookmarkCounters[bmkc] = res.meta.totalcount;
        });

    }

  }

  public loadBookmark(bookmark) {
    this.bookmarkLoaded = bookmark;
  }
}
