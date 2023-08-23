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
        Sbg: { f: { TL: { name: '', unit: '', data: [] }, RR: { name: '', unit: '', data: [] }, P: { name: '', unit: '', data: [] } }, fetching: true },
        Vienna: { f: { TL: { name: '', unit: '', data: [] }, RR: { name: '', unit: '', data: [] }, P: { name: '', unit: '', data: [] } }, fetching: true },
        Innsbruck: { f: { TL: { name: '', unit: '', data: [] }, RR: { name: '', unit: '', data: [] }, P: { name: '', unit: '', data: [] } }, fetching: true },
        Graz: { f: { TL: { name: '', unit: '', data: [] }, RR: { name: '', unit: '', data: [] }, P: { name: '', unit: '', data: [] } }, fetching: true },
      };
    },
    methods: {
      async fetchTemps() {
        this.Sbg.fetching = true;
        this.fetchStation(11150).then((res) => {
          this.Sbg.f = res;
          this.Sbg.fetching = false;
        });
        this.Vienna.fetching = true;
        this.fetchStation(11034).then((res) => {
          this.Vienna.f = res;
          this.Vienna.fetching = false;
        });
        this.Innsbruck.fetching = true;
        this.fetchStation(11320).then((res) => {
          this.Innsbruck.f = res;
          this.Innsbruck.fetching = false;
        });
        this.Graz.fetching = true;
        this.fetchStation(11290).then((res) => {
          this.Graz.f = res;
          this.Graz.fetching = false;
        });
      },
      async fetchStation(stationId) {
        const res = await fetch(`https://dataset.api.hub.zamg.ac.at/v1/station/current/tawes-v1-10min?station_ids=${stationId}&parameters=TL,P,RR`);
        const json = await res.json();
        return json.features.at(0).properties.parameters;
      },
      onLogout() {
        document.cookie = 'userid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        window.location.href = '/login';
      },
    },
    mounted() {
      this.fetchTemps();
    },
  },
).mount('#current');

// HABEN : NAVBAR, MODAL, CARDS, DROPDOWN MENÜ, DROPDOWN BUTTON, ALERT BANNER, SPINNER,
// v-for, {{bindings}}, v-if, v-else, v-model, @click
