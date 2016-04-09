import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  classNames: ['row'],
  $mapObject: null,
  loadingDetails: false,
  queryError: null,
  countrySelection: null,
  previousSelection: null,
  currentQuery: null,
  countryData: null,
  countryDataString: Ember.computed('countryData', function(){
    let data = JSON.stringify(this.get('countryData'));
    return data;
  }),

  displayCountryData(queryResults,  mapComponent) {
    mapComponent.setProperties({
      countryData: queryResults,
      loadingDetails: false
    });
  },

  handleFailedQuery(mapComponent) {
    mapComponent.setProperties({
      queryError: 'DBpedia had trouble processing this request',
      loadingDetails: false
    });
  },

  handleSuccessfulQuery(data, mapComponent) {
    let queryResults = data.results.bindings[0];
    if(queryResults) {
      mapComponent.displayCountryData(queryResults, mapComponent);
    } else {
      mapComponent.setProperties({
        queryError: `No results were found for ${geography.properties.name}`,
        loadingDetails: false
      });
    }
  },

  requestData(queryUrl, geography, mapComponent) {
    Ember.$.ajax({
      dataType: "jsonp",
      accept: "application/json",
      contentType: "application/sparql-query",
      url: queryUrl,
      success: function(data) {
        mapComponent.handleSuccessfulQuery(data, mapComponent);
      },
      fail: function() {
        mapComponent.handleFailedQuery(mapComponent);
      }
    });
  },

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

  buildQuery(geography, mapComponent) {
    let query = [
      "SELECT * WHERE {\n",
      "?x a dbo:Country.\n",
      "?x rdfs:label \"" + geography.properties.name + "\"@en.\n",
      "?x dbp:commonName ?name.\n",
      "?x dbo:populationTotal ?pop.\n",
      "?x geo:lat ?lat.\n",
      "?x geo:long ?long.\n",
      "?x dbo:officialLanguage ?lang.\n",
      "?x dbo:currency ?cur.\n",
      "?x dbo:capital ?cap.\n",
      "?x dbo:abstract ?ab.\n",
      "FILTER langMatches(lang(?ab),'en')\n",
      "}"
    ].join(" ");
    let queryUrl = "http://dbpedia.org/sparql?query=" + encodeURI(query) + "&format=json";
    mapComponent.set('currentQuery', query);
    mapComponent.requestData(queryUrl, geography, mapComponent);
  },

  updateMapState(geography, mapComponent) {
    mapComponent.setProperties({
      countryData: null,
      queryError: null,
      loadingDetails: true,
      previousSelection: mapComponent.get('countrySelection'),
      countrySelection: geography
    });
    mapComponent.highlightActiveCountry(geography);
  },

  setupClickHandler(datamap, mapComponent) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      mapComponent.updateMapState(geography, mapComponent);
      mapComponent.buildQuery(geography, mapComponent);
    });
  },

  initializeMap() {
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
    this.initializeMap();
  }
});
