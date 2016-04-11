import Ember from 'ember';

export default Ember.Service.extend({
  countrySelection: null,
  currentQuery: null,
  countryData: null,
  queryError: null,
  loadingDetails: false,

  opts: {
    resource: {include: true},
    name: {include: true},
    population: {include: true, query:"OPTIONAL {?x dbo:populationTotal ?pop}.\n"},
    lat: {include: false, query:"OPTIONAL {?x geo:lat ?lat}.\n"},
    long: {include: false, query:"OPTIONAL {?x geo:long ?long}.\n"},
    language: {include: false, query:"OPTIONAL {?x dbo:officialLanguage ?lang}.\n"},
    currency: {include: false, query:"OPTIONAL {?x dbo:currency ?cur}.\n"},
    capital: {include: false, query:"OPTIONAL {?x dbo:capital ?cap}.\n"},
    abstract: {include: false, query:"OPTIONAL {?x dbo:abstract ?ab}.\n FILTER langMatches(lang(?ab),'en')\n"}
  },

  setCountryData(queryResults) {
    return this.setProperties({
      countryData: queryResults,
      loadingDetails: false
    });
  },

  handleFailedQuery() {
    return this.setProperties({
      queryError: 'DBpedia had trouble processing this request',
      loadingDetails: false
    });
  },

  handleSuccessfulQuery(data, geography) {
    let queryResults = data.results.bindings[0];
    if(queryResults) {
      return this.setCountryData(queryResults);
    } else {
      return this.setProperties({
        queryError: `No results were found for ${geography.properties.name}`,
        loadingDetails: false
      });
    }
  },

  requestData(queryUrl, geography) {
    let sparqler = this;
    return Ember.$.ajax({
      type: "GET",
      dataType: "jsonp",
      accept: "application/json",
      contentType: "application/sparql-query",
      url: queryUrl,
      success: function(data) {
        return sparqler.handleSuccessfulQuery(data, geography);
      },
      error: function() {
        return sparqler.handleFailedQuery();
      }
    });
  },

  buildQuery(geography) {
    let opts = this.get('opts');
    let validateInclude = function(opt) {
      return opt.include ? opt.query : "";
    };
    let query = [
      "SELECT * WHERE {\n",
      "?x a dbo:Country.\n",
      "?x rdfs:label \"" + geography.properties.name + "\"@en.\n",
      "?x dbp:commonName ?name.\n",
      validateInclude(opts.population),
      validateInclude(opts.lat),
      validateInclude(opts.long),
      validateInclude(opts.language),
      validateInclude(opts.currency),
      validateInclude(opts.capital),
      validateInclude(opts.abstract),
      "}"
    ].join(" ");
    let queryUrl = "http://dbpedia.org/sparql?query=" + encodeURI(query) + "&format=json";
    this.initializeQuery(geography);
    this.set('currentQuery', query);
    return this.requestData(queryUrl, geography);
  },

  initializeQuery(geography) {
    return this.setProperties({
      countrySelection: geography,
      countryData: null,
      queryError: null,
      loadingDetails: true,
    });
  },

  clearQuery() {
    this.setProperties({
      countrySelection: null,
      currentQuery: null,
      countryData: null
    });
  }
});
