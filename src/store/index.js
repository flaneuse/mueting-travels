import Vue from 'vue';
import Vuex from 'vuex';


Vue.use(Vuex);

import {
  format
} from "d3-format";

import {
  nest
} from "d3-collection";

// basemap from https://www.census.gov/geographies/mapping-files/time-series/geo/carto-boundary-file.html
// dictionary: https://www.census.gov/programs-surveys/geography/technical-documentation/records-layout/gaz-record-layouts.html
import COUNTIES from "@/assets/cb_2018_us_county_20m.json";
import STATES from "@/assets/cb_2018_us_state_20m.json";



const calcTotal = function(results, person, totalCounties, totalBarWidth = 300) {
  // calculate non-zero total

  const total = results.map(d => +d[person]).reduce((prev, curr) => curr + prev);
  const pct = total / totalCounties;
  const pctFormatted = format(".1%")(pct);
  const barWidth = pct * totalBarWidth;

  return ({
    total: total,
    percent: pct,
    totalRemaining: totalCounties - total,
    percentFormatted: pctFormatted,
    barWidth: barWidth
  })
}


export default new Vuex.Store({
  state: {
    loading: false,
    people: ["Tim", "Carla", "Sam", "Cody", "John", "Jenny", "Nathan", "Elise"],
    selectedPeople: ["Tim", "Carla", "Sam", "Cody", "John", "Jenny", "Nathan", "Elise"],
    geojson: null,
    states: null,
    totals: null,
    stateTotals: null,
    totalCounties: null,
    colorPalette: {
      "all": {
        color: "#373434",
        label: "all"
      },
      "five_seven": {
        color: "#612e09",
        label: "5-7 people"
      },
      "two_four": {
        color: "#ac5c22",
        label: "2-4 people"
      },
      "Tim": {
        color: "#e41a1c",
        lightColor: "#fdd3d3",
        label: "Tim"
      },
      "Carla": {
        color: "#3773b8",
        lightColor: "#cee5ff",
        label: "Carla"
      },
      "Sam": {
        color: "#ffff33",
        lightColor: "#ffffc1",
        label: "Sam"
      },
      "Cody": {
        color: "#4daf4a",
        label: "Cody"
      },
      "John": {
        color: "#ff7f00",
        label: "John"
      },
      "Jenny": {
        color: "#984ea3",
        label: "Jenny"
      },
      "Nathan": {
        color: "#f781bf",
        label: "Nathan"
      },
      "Elise": {
        color: "#f0f000",
        label: "Elise"
      },
      "unknown": {
        color: "#ddddd8",
        label: "no one"
      }
    }
  },
  mutations: {
    updateGeojson(state, selectedPeople) {
      state.geojson["features"].forEach(d => {
        const filtered = d.properties.hasVisited.filter(x => selectedPeople.includes(x));
        const total = filtered.length;

        const colorMap =
        total > 7 ? "all" :
        total > 4 ? "five_seven" :
        total > 1 ? "two_four" :
        total == 1 ? filtered[0] :
        "unknown";

        d["properties"]["fillColor"] = colorMap
      });

      // Deep copy as a shim to force Vue to update
      const payload = JSON.parse(JSON.stringify(state.geojson));

      Object.assign(state.geojson, payload);
    },
    updateSelectedPeople(state, newSelected) {
      state.selectedPeople = newSelected;
    }
  },
  actions: {
    fetchData(context) {
      context.state.loading = true;

      const reader = require('g-sheets-api');
      const readerOptions = {
        apiKey: process.env.VUE_APP_GOOGLESHEETS_API_KEY,
        sheetId: '1Rj0M82tUfPT6EtBJB4ydeRqhOk8PLyoQdappyRb-0Fo', // Link to Google sheet. Should have permissions set to "anyone with link can view"
        sheetName: 'us_counties',
        returnAllResults: true
      };

      reader(readerOptions, (results) => {
        // calculate overall totals by person
        context.state.totals = {}
        context.state.totalCounties = results.length;
        // calculate totals
        context.state.people.forEach(person => {
          context.state.totals[person] = calcTotal(results, person, results.length);
        })

        // calculate totals by state
        const nested = nest()
          .key(d => d.state)
          .rollup(values => {
            let obj = {}

            context.state.people.forEach(person => {
              obj[person] = calcTotal(values, person, values.length);
            })

            return ({
              total: values.length,
              people: obj,
              values: values
            })
          })
          .entries(results);

          nested.forEach(d => {
            d.total = d.value.total;
          })

        context.state.stateTotals = nested;

        // process the google sheets: Merge together
        context.state.geojson = COUNTIES;
        context.state.states = STATES;

        context.state.geojson["features"].forEach(d => {
          const filtered = results.filter(row => row.id == d.properties.AFFGEOID);
          if (filtered.length == 1) {
            d["properties"]["population"] = filtered[0].population_2019;
            d["properties"]["state"] = filtered[0].state;

            const Tim = filtered[0].Tim === "1";
            const Carla = filtered[0].Carla === "1";
            const Sam = filtered[0].Sam === "1";
            const Cody = filtered[0].Cody === "1";
            const John = filtered[0].John === "1";
            const Jenny = filtered[0].Jenny === "1";
            const Nathan = filtered[0].Nathan === "1";
            const Elise = filtered[0].Elise === "1";

            const total = Tim + Carla + Sam + Cody + John + Jenny + Nathan + Elise;


            // calculating the color
            const value =
              total > 7 ? "all" :
              total > 4 ? "five_seven" :
              total > 1 ? "two_four" :
              Tim ? "Tim" :
              Carla ? "Carla" :
              Sam ? "Sam" :
              Cody ? "Cody" :
              John ? "John" :
              Jenny ? "Jenny" :
              Nathan ? "Nathan" :
              Elise ? "Elise" :
              "unknown";

            const hasVisited = {
              Tim: Tim,
              Carla: Carla,
              Sam: Sam,
              Cody: Cody,
              John: John,
              Jenny: Jenny,
              Nathan: Nathan,
              Elise: Elise
            }

            d["properties"]["Tim"] = Tim;
            d["properties"]["Carla"] = Carla;
            d["properties"]["Sam"] = Sam;
            d["properties"]["Cody"] = Cody;
            d["properties"]["John"] = John;
            d["properties"]["Jenny"] = Jenny;
            d["properties"]["Nathan"] = Nathan;
            d["properties"]["Elise"] = Elise;
            d["properties"]["fillColor"] = value; //this.colorPalette[value].color;
            d["properties"]["hasVisited"] = Object.keys(hasVisited).filter(key => hasVisited[key]);
          }
        })

        context.state.loading = false;
      });

    }
  },
  getters: {
    getStateTotal: (state) => (name) => {
      return (state.stateTotals ? state.stateTotals.filter(d => d.key == name) : null)
    },
    getStateGeojson: (state) => (name) => {
      if(state.geojson){
        const geo = state.geojson.features.filter(d => d.properties.state == name);
      return {features: geo}
      } else {
        return(null)
      }

    }
  },
  modules: {},
});
