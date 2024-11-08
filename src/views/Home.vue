<template>
  <div>
    <h1>
      How many counties in the United States have the Mueting family visited?
    </h1>
    <div class="d-flex align-items-center w-100 m-3" v-if="loading">
      <strong class="mx-5">Loading...</strong>
      <div class="spinner-border text-primary ml-auto" role="status" aria-hidden="true"></div>
    </div>

    <div class="d-flex mx-4 align-items-start">
      <table v-if="totals">
        <tr>
          <th class="px-2">
            <v-checkbox :input-value="isAllSelected" :indeterminate="isIndeterminate"
              @change="toggleSelectAll"></v-checkbox>
          </th>
          <th></th>
          <th>total</th>
          <th>completion</th>
        </tr>

        <tr v-for="(person, pIdx) in people" :key="pIdx" class="text-right">
          <td class="px-2 m-0">
            <v-checkbox v-model="selectedPeople" label="" :value="person"></v-checkbox>
          </td>

          <td class="px-2">
            <h3 class="mb-0">{{ person }}</h3>
          </td>
          <td class="px-2 pt-4 d-flex flex-column">
            <h4 class="mb-0">{{ totals[person]["total"] }}</h4>
            <div>
              {{ totals[person]["percentFormatted"] }}
            </div>
          </td>
          <td class="px-2">
            <svg :width="totalBarWidth" :height="totalBarHeight">
              <rect :width="totals[person]['barWidth']" :height="totalBarHeight" :fill="colorPalette[person]['color']">
              </rect>
              <rect :width="totalBarWidth / 2" :height="totalBarHeight" fill="none" stroke-dasharray="4,4"
                stroke="#ccc">
              </rect>
              <rect :width="totalBarWidth / 4" :height="totalBarHeight" fill="none" stroke-dasharray="4,4"
                stroke="#ccc">
              </rect>
              <rect :width="(totalBarWidth / 4) * 3" :height="totalBarHeight" fill="none" stroke-dasharray="4,4"
                stroke="#ccc"></rect>
              <rect :width="totalBarWidth" :height="totalBarHeight" fill="none" stroke="#000"></rect>
            </svg>
          </td>
        </tr>
      </table>

      <!-- TODO: switch bar graph by number of counties, percent area, percent pop -->
      <!-- TODO: filters: on/off for people -->
      <!-- TODO: bar graphs by state -->
      <!-- TODO: zoom into a state -->
      <!-- TODO: loading spinner -->
      <!-- TODO: avoid too many API calls? cache? -->
      <!-- TODO: button to check for new data, save as .geojson -->
      <!-- TODO: add data last fetched info -->
      <!-- TODO: migrate to real Google API -->
      <!-- TODO: fix styling -->
      <!-- TODO: fix nav bar -->
      <!-- TODO: font awesome import fix -->
      <!-- TODO: bootstrap import, styling, classes -->
      <!-- TODO: basemap: get hwys, opacity slider, city labels on top -->
      <!-- TODO: refactor for multiple people -->
      <!-- TODO: Weight by pop, area, percent -->
      <!-- TODO: zoom to state (sep page?), mini map, table (missing, completed x person with name/pop/area + total), % complete bar-->
      <!-- TODO: mobile responsiveness -->
      <!-- TODO: button to zoom to reset to full view -->
      <!-- TODO: fix zoom/pan extent -->
      <!-- TODO: dim other counties, highlight with stroke on mouseover -->
      <!-- TODO: remove unneccessary packages -->
      <!-- TODO: switch data to updated maps -->
      <!-- TODO: merge in additional data? -->
      <!-- TODO: fix API Key -->

      <div class="mx-4" v-if="!loading">
        <Legend :colorPalette="colorPalette" />

        <!-- :bounds="bounds" :max-bounds="maxBounds"> -->
        <l-map :style="mapStyle" :zoom="zoom" :minZoom="minZoom" :maxZoom="maxZoom" :center="center">

          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-geo-json :geojson="geojson" :options="options" :options-style="styleFunction"></l-geo-json>
          <l-geo-json :geojson="states" :options-style="styleFunctionState"></l-geo-json>
          <l-tile-layer :url="labelUrl" :attribution="attribution"></l-tile-layer>
          <l-tile-layer :url="labelUrl" :attribution="attribution"></l-tile-layer>
        </l-map>

      </div>
    </div>
  </div>

</template>

<script>
import { } from "leaflet";
import {
  LMap,
  LTileLayer,
  LGeoJson,
} from 'vue2-leaflet';

// basemap from https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html
// dictionary: https://www.census.gov/programs-surveys/geography/technical-documentation/records-layout/gaz-record-layouts.html
import STATES from "@/assets/cb_2018_us_state_20m.json";

import store from '@/store';

export default {
  name: 'Home',
  components: {
    LMap,
    LTileLayer,
    LGeoJson,
    Legend: () => import(/* webpackPrefetch: true */ `@/components/Legend.vue`)
  },
  mounted() {
    this.selectedPeople = this.selectedPeopleStore
  },
  watch: {
    selectedPeople(newValue) {
      if(!this.loading){
      // Adjust the header checkbox
      this.isAllSelected = newValue.length > 0;
      this.isIndeterminate = (newValue.length < this.people.length) && (newValue.length > 0);

      // update the map
      store.commit('updateGeojson', newValue)
      store.commit('updateSelectedPeople', newValue)
    }}
  },
  methods: {
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedPeople = []; // Deselect all
      } else {
        this.selectedPeople = this.people; // Select all
      }
    }
  },
  data() {
    return ({
      fillOpacity: 0.6,
      height: 800, // height of map in px

      // basemaps
      url: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
      labelUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lines/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',

      // map params
      center: [38.967243, -103.771556],
      // bounds: latLngBounds([
      //   [40.70081290280357, -74.26963806152345],
      //   [40.82991732677597, -74.08716201782228]
      // ]),
      // maxBounds: latLngBounds([
      //   [40.70081290280357, -74.26963806152345],
      //   [40.82991732677597, -74.08716201782228]
      // ]),
      minZoom: 3,
      maxZoom: 11,
      zoom: 5,

      // data
      states: null,

      totalBarWidth: 150,
      totalBarHeight: 25,

      // input options
      selectedPeople: [],
      isAllSelected: true,
      isIndeterminate: false
    })
  },
  computed: {
    loading() {
      return store.state.loading
    },
    people() {
      return store.state.people
    },
    selectedPeopleStore() {
      return store.state.selectedPeople
    },
    geojson() {
      return store.state.geojson
    },
    totals() {
      return store.state.totals
    },
    colorPalette() {
      return store.state.colorPalette
    },
    mapStyle() {
      return (`height: ${this.height}px`)
    },
    options() {
      return {
        onEachFeature: this.onEachFeatureFunction
      };
    },
    styleFunction() {
      return () => {
        return {
          weight: 0.25,
          color: "#000000",
          opacity: 1,
          fillOpacity: this.fillOpacity
        };
      };
    },
    styleFunctionState() {
      return () => {
        return {
          fill: null,
          weight: 1.5,
          color: "#000000",
          opacity: 1,
          fillOpacity: 0
        };
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {

        layer.setStyle({
          fillColor: this.colorPalette[feature.properties.fillColor].color
        });

        layer.bindTooltip(
          `<div class="text-left">
          <div>
          <b>${feature.properties.NAME} County, ${feature.properties.state}</b>
          </div>
          <div>
          population (est. 2019): ${feature.properties.population}
          </div>
          <div>
          Tim: ${feature.properties.Tim ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          Carla: ${feature.properties.Carla ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          Sam: ${feature.properties.Sam ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          Cody: ${feature.properties.Cody ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          John: ${feature.properties.John ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          Jenny: ${feature.properties.Jenny ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          Nathan: ${feature.properties.Nathan ? '<i class="fas fa-square"></i>' : '<i class="far fa-square"></i>'}
          </div>
          <div>
          land area: ${feature.properties.ALAND.toLocaleString()} sq. m
          </div>
          </div>
          `, {
          permanent: false,
          sticky: true
        }
        );
      };
    }
  },
  async created() {
    // load the state shapefile
    this.states = STATES;
  }
}
</script>
<style lang="scss" scoped>
.mr-4 {
  margin-right: 2rem;
}

th {
  height: 10px;
  line-height: 10px;
  margin: 0;
  padding: 0;
  background-color: #eee;
}
</style>
