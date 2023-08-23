/* eslint-disable*/
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
/* eslint-enable */
/* eslint-disable no-unused-vars */
/* global myChart */
/* global feather, Chart */

/*
  This File is the starting Point for your personal
  JavaScript enhancements. The code below is just for
  demo purposes and may be removed.
 */

feather.replace({
  'aria-hidden': 'true',
});

// https://vuejs.org/guide/quick-start.html#using-vue-from-cdn

// https://dataset.api.hub.zamg.ac.at/v1/station/current/klima-v1-10min/filter?state=Salzburg
// https://dataset.api.hub.zamg.ac.at/v1/openapi-docs#/all%20datasets/View_and_filter_all_available_datasets_datasets_get
// https://dataset.api.hub.zamg.ac.at/v1/docs/daten.html#rasterdaten-oder-stationsdaten
createApp(
  {
    data() {
      return {
        filter: { state: '', id: '', name: '' },
        add: { state: '', id: '', name: '' },
        change: { state: '', id: '', name: '' },
        del: { id: '' },
        stations: [],
        errMsg: { add: '', change: '', del: '' },
        successMsg: { add: '', change: '', del: '' },
      };
    },
    methods: {
      fetchStations() {
        this.errMsg = { add: '', change: '', del: '' };
        this.successMsg = { add: '', change: '', del: '' };
        fetch(`/api/stations?state=${this.filter.state}&name=${this.filter.name}&id=${this.filter.id}`)
          .then((res) => res.json())
          .then((json) => { this.stations = json; });
      },
      async addStation() {
        this.errMsg = { add: '', change: '', del: '' };
        this.successMsg = { add: '', change: '', del: '' };
        if (!this.add.id || !this.add.name || !this.add.state) {
          this.errMsg.add = 'Bitte füllen Sie alle Felder aus!';
          return;
        }
        const res = await fetch('/api/stations', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: this.add.id,
            name: this.add.name,
            state: this.add.state,
          }),
        });
        const json = await res.json();
        if (res.status === 400) {
          this.errMsg.add = json;
        } else {
          this.successMsg.add = json;
        }
      },
      async updateStation() {
        this.errMsg = { add: '', change: '', del: '' };
        this.successMsg = { add: '', change: '', del: '' };
        if (!this.change.id || (!this.change.name && !this.change.state)) {
          this.errMsg.change = 'Bitte füllen Sie ID und mindestens ein weiteres Feld aus!';
          return;
        }
        const res = await fetch('/api/stations', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: this.change.id,
            name: this.change.name,
            state: this.change.state,
          }),
        });
        const json = await res.json();
        if (res.status === 400) {
          this.errMsg.change = json;
        } else {
          this.successMsg.change = json;
        }
      },
      async deleteStation() {
        this.errMsg = { add: '', change: '', del: '' };
        this.successMsg = { add: '', change: '', del: '' };
        if (!this.del.id) {
          this.errMsg.del = 'Bitte füllen Sie das Feld aus!';
          return;
        }
        const res = await fetch('/api/stations', {
          method: 'DELETE',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            id: this.del.id,
          }),
        });
        const json = await res.json();
        if (res.status === 400) {
          this.errMsg.del = json;
        } else {
          this.successMsg.del = json;
        }
      },
      onLogout() {
        document.cookie = 'userid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        window.location.href = '/login';
      },
    },
    mounted() {
      const d = new Date();
      this.endDate = d.toISOString().substring(0, 10);
      d.setDate(d.getDate() - 7);
      this.startDate = d.toISOString().substring(0, 10);
    },
  },
).mount('#internal');
