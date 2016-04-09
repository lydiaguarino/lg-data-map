import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  classNames: ['row'],
  $mapObject: null,
  countrySelection: null,
  previousSelection: null,
  countryData: null,

  highlightActiveCountry(geography) {
    let activeCountry = geography.id;
    let previousCountry = this.get('previousSelection.id');
    let $mapObject = this.get('$mapObject');
    let dataObject = {};
    if (activeCountry !== previousCountry) {
      dataObject[previousCountry] = { fillKey: 'visited' };
    }
    dataObject[activeCountry] = { fillKey: 'active' };
    $mapObject.updateChoropleth(dataObject);
  },

  displayCountryData(queryResults, geography, mapComponent) {
    let previous = mapComponent.get('countrySelection');
    mapComponent.setProperties({
      previousSelection: previous,
      countrySelection: geography,
      countryData: queryResults
    });
    mapComponent.highlightActiveCountry(geography);
  },

  requestData(queryUrl, geography, mapComponent){
    Ember.$.ajax({
      dataType: "jsonp",
      url: queryUrl,
      success: function( data ) {
        let queryResults = data.results.bindings[0];
        if(queryResults) {
          mapComponent.displayCountryData(queryResults, geography, mapComponent);
        } else {
          console.log('No results were found for', geography.properties.name);
        }
      },
      fail: function( jqXHR, textStatus, error ) {
        console.log('error', error);
      }
    });
  },

  buildQuery: function(geography, mapComponent){
    let query = [
      "SELECT * WHERE {",
      "?x a dbo:Country.",
      "?x rdfs:label \"" + geography.properties.name + "\"@en.",
      "?x dbp:commonName ?n.",
      "?x dbo:populationTotal ?p.",
      "?x dbo:abstract ?a.",
      "FILTER langMatches(lang(?a),'en')",
      "}"
    ].join(" ");
    let queryUrl = "http://dbpedia.org/sparql?query=" + encodeURI(query) + "&format=json";
    mapComponent.requestData(queryUrl, geography, mapComponent);
  },

  setupClickHandler(datamap, mapComponent) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      mapComponent.set('countryData', null);
      mapComponent.buildQuery(geography, mapComponent);
    });
  },

  createNewMap() {
    let mapComponent = this;
    this.set('$mapObject', new Datamap({
      element: document.getElementById('world-map-container'),
      fills: {
        defaultFill: '#555556',
        active: '#f07464',
        visited: '#7e7e7e'
      },
      geographyConfig: {
        borderColor: '#bfbfc0',
        highlightFillColor: '#f07464',
        highlightBorderColor: '#fff',
        highlightBorderWidth: 1
      },
      done: function(datamap) {
        mapComponent.setupClickHandler(datamap, mapComponent);
      }
    }));
  },

  didInsertElement() {
    this._super(...arguments);
    this.createNewMap();
  }
});
