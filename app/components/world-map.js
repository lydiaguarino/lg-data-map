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
  showOptions: false,
  opt: {
    resource: {include: true},
    name: {include: true},
    population: {include: true, query:"?x dbo:populationTotal ?pop.\n"},
    lat: {include: false, query:"?x geo:lat ?lat.\n"},
    long: {include: false, query:"?x geo:long ?long.\n"},
    language: {include: false, query:"?x dbo:officialLanguage ?lang.\n"},
    currency: {include: false, query:"?x dbo:currency ?cur.\n"},
    capital: {include: false, query:"?x dbo:capital ?cap.\n"},
    abstract: {include: false, query:"?x dbo:abstract ?ab.\n FILTER langMatches(lang(?ab),'en')\n"}
  },
  countryDataString: Ember.computed('countryData', function(){
    let data = JSON.stringify(this.get('countryData'));
    return data;
  }),

  displayCountryData(queryResults,  mapComponent) {
    return mapComponent.setProperties({
      countryData: queryResults,
      loadingDetails: false
    });
  },

  handleFailedQuery(mapComponent) {
    return mapComponent.setProperties({
      queryError: 'DBpedia had trouble processing this request',
      loadingDetails: false
    });
  },

  handleSuccessfulQuery(data, geography, mapComponent) {
    let queryResults = data.results.bindings[0];
    if(queryResults) {
      return mapComponent.displayCountryData(queryResults, mapComponent);
    } else {
      return mapComponent.setProperties({
        queryError: `No results were found for ${geography.properties.name}`,
        loadingDetails: false
      });
    }
  },

  requestData(queryUrl, geography, mapComponent) {
    return Ember.$.ajax({
      type: "GET",
      dataType: "jsonp",
      accept: "application/json",
      contentType: "application/sparql-query",
      url: queryUrl,
      success: function(data) {
        return mapComponent.handleSuccessfulQuery(data, geography, mapComponent);
      },
      error: function() {
        return mapComponent.handleFailedQuery(mapComponent);
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
    return $mapObject.updateChoropleth(dataObject);
  },

  buildQuery(geography, mapComponent) {
    let opt = mapComponent.get('opt');
    let validateInclude = function(opt) {
      return opt.include ? opt.query : "";
    };
    let query = [
      "SELECT * WHERE {\n",
      "?x a dbo:Country.\n",
      "?x rdfs:label \"" + geography.properties.name + "\"@en.\n",
      "?x dbp:commonName ?name.\n",
      validateInclude(opt.population),
      validateInclude(opt.lat),
      validateInclude(opt.long),
      validateInclude(opt.language),
      validateInclude(opt.currency),
      validateInclude(opt.capital),
      validateInclude(opt.abstract),
      "}"
    ].join(" ");
    let queryUrl = "http://dbpedia.org/sparql?query=" + encodeURI(query) + "&format=json";
    mapComponent.set('currentQuery', query);
    return mapComponent.requestData(queryUrl, geography, mapComponent);
  },

  updateMapState(geography, mapComponent) {
    let previousSelection = mapComponent.get('countrySelection');
    mapComponent.setProperties({
      countryData: null,
      queryError: null,
      loadingDetails: true,
      previousSelection: previousSelection,
      countrySelection: geography
    });
    return mapComponent.highlightActiveCountry(geography);
  },

  setupClickHandler(datamap, mapComponent) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      mapComponent.updateMapState(geography, mapComponent);
      return mapComponent.buildQuery(geography, mapComponent);
    });
  },

  initializeMap() {
    let mapComponent = this;
    return this.set('$mapObject', new Datamap({
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
        return mapComponent.setupClickHandler(datamap, mapComponent);
      }
    }));
  },

  didInsertElement() {
    this._super(...arguments);
    return this.initializeMap();
  },

  actions: {
    toggleDropdown() {
      this.toggleProperty('showOptions');
    },
    resetQuery() {
      this.setProperties({
        currentQuery: null,
        countryData: null
      });
    }
  }
});
