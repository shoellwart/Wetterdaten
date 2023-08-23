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
        states: ['Burgenland', 'Kärnten', 'Niederösterreich', 'Oberösterreich', 'Salzburg', 'Steiermark', 'Tirol', 'Vorarlberg', 'Wien'],
        stations: [],
        stateSelected: false,
        activeStation: { id: '', name: '' },
        startDate: Date.now().toString(),
        endDate: Date.now().toString(),
        currentStationData: {},
        timeResolution: '1d',
        errMsg: '',
        fetchingStationData: false,
      };
    },
    methods: {
      onStateSelect(ev) {
        const selectedState = ev.target.value;
        this.fetchStationsState(selectedState);
        this.stateSelected = true;
      },
      fetchStationsState(state) {
        fetch(`https://dataset.api.hub.zamg.ac.at/v1/station/{mode}/klima-v1-10min/filter?state=${state}&start_date=2021-01-01&end_date=2021-01-01`)
          .then((res) => res.json())
          .then((json) => { this.stations = json.matching_stations; });
      },
      onStationSelect(ev) {
        const selectedStation = ev.target.value;
        this.activeStation.id = selectedStation;
        this.activeStation.name = this.stations.find((elem) => elem.id === selectedStation).name;
        // this.fetchStationData();
      },
      fetchStationData() {
        const sD = new Date(this.startDate);
        const eD = new Date(this.endDate);
        if (sD <= eD) {
          this.errMsg = '';
          this.fetchingStationData = true;
          fetch(`https://dataset.api.hub.zamg.ac.at/v1/station/historical/klima-v1-${this.timeResolution}?parameters=t&start=${this.startDate}&end=${this.endDate}&station_ids=${this.activeStation.id}&output_format=geojson`)
            .then((res) => res.json())
            .then((json) => {
              this.currentStationData = json;
              this.fetchingStationData = false;
              this.drawGraph();
            });
        } else {
          this.errMsg = 'Das Startdatum muss vor dem Enddatum liegen';
          const canvas = document.getElementById('historicalChart');
          const ctx = canvas.getContext('2d');
          const myChart = canvas.chart;
          if (myChart) {
            myChart.destroy();
          }
        }
      },
      selectResolution1D() { this.timeResolution = '1d'; },
      selectResolution1M() {
        this.timeResolution = '1m';
        const d = new Date();
        d.setDate(d.getDate() - 365);
        this.startDate = d.toISOString().substring(0, 10);
      },
      drawGraph() {
        const labels = [];
        const data = {
          labels,
          datasets: [{
            label: `Tagesmitteltemperaturen in ${this.activeStation.name} von ${this.startDate} bis ${this.endDate}`,
            backgroundColor: 'rgb(10, 120, 10)',
            borderColor: 'rgb(10, 120, 10)',
            data: [],
          }],
        };
        this.currentStationData.timestamps.forEach((element) => {
          labels.push(element.substring(0, 10));
        });
        this.currentStationData.features[0].properties.parameters.t.data.forEach((element) => {
          data.datasets[0].data.push(element);
        });
        const config = {
          type: 'line',
          data,
          options: {},
        };
        const canvas = document.getElementById('historicalChart');
        const ctx = canvas.getContext('2d');
        let myChart = canvas.chart;
        if (myChart) {
          myChart.destroy();
        }
        myChart = new Chart(ctx, config);
        canvas.chart = myChart;
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
).mount('#historical');

// HABEN : NAVBAR, MODAL, CARDS, DROPDOWN MENÜ, DROPDOWN BUTTON, ALERT BANNER, SPINNER,
// v-for, {{bindings}}, v-if, v-else, v-model, @click
