import Ember from 'ember';

export default Ember.Service.extend({
  /**
   * The geography object received from the map input component.
   * Used primarily for display purposes
   *
   * @property countrySelection
   * @type Object
   * @default null
   */
  countrySelection: null,

  /**
   * The constructed query string value, used primarily for preview display.
   *
   * @property currentQuery
   * @type String
   * @default null
   */
  currentQuery: null,

 /**
   * The country resource object returned from DBpedia.
   *
   * @property countryData
   * @type Object
   * @default null
   */
  countryData: null,

  /**
   * A status variable used to display query response errors to the user.
   *
   * @property queryError
   * @type String
   * @default null
   */
  queryError: null,

  /**
   * A toggleable flag used to display a loading modal while data is fetched.
   *
   * @property loadingDetails
   * @type Boolean
   * @default false
   */
  loadingDetails: false,

  /**
   * A mapping of available query options and their associated inclusion states.
   * These options are displayed to the user as checkboxes and can be toggled
   * for inclusion. When included, the associated query string is added to the
   * constructed query URI. Query properties are listed as optional so that they
   * do not prevent a response if the resulting resource does not contain that
   * property. For example, some countries do not have a populationTotal prop.
   *
   * @property opts
   * @type Object
   */
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

  /**
   * Once query results are successfully returned from DBpedia,
   * make the data available for viewing by updating the countryData property.
   * Hide the loading modal.
   */
  setCountryData(queryResults) {
    return this.setProperties({
      countryData: queryResults,
      loadingDetails: false
    });
  },

  /**
   * If there is a reported AJAX failure, notify the user by updating the
   * queryError property. Hide the loading modal.
   */
  handleFailedQuery() {
    return this.setProperties({
      queryError: 'DBpedia had trouble processing this request or it timed out',
      loadingDetails: false
    });
  },

  /**
   * If the AJAX request succeeds, verify that the response contains data.
   * If the result data is empty, notify the user by updating the queryError
   * property and terminate the loading modal. Otherwise, isolate the first
   * country resource returned in the dataset and display it to the user.
   */
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

  /**
   * Once a queryUrl is available, trigger an AJAX request to DBpedia
   * to fetch the query data. If the response takes longer than 10 seconds,
   * force a failure. This is to safeguard against extra long queries as well as
   * instances where the DBPedia endpoint is not available.
   */
  requestData(queryUrl, geography) {
    let sparqler = this;
    return Ember.$.ajax({
      type: "GET",
      dataType: "jsonp",
      accept: "application/json",
      contentType: "application/sparql-query",
      url: queryUrl,
      timeout: 10000,
      success: function(data) {
        return sparqler.handleSuccessfulQuery(data, geography);
      },
      error: function() {
        return sparqler.handleFailedQuery();
      }
    });
  },

  /**
   * Assess the user's query options settings and dynamically construct a SPARQL
   * query string from the included options. Clear out any lingering values from
   * previous queries and display the constructed query to the user by updating
   * currentQuery property. Construct a queryUrl from from the query string and
   * trigger the query request.
   */
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

  /**
   * Make sure that each request starts with clean display properties.
   * Alert the user that a request has successfully been submitted by displaying
   * a loading modal. Confirm which country they selected by displaying the
   * geography selection to them in the loading screen.
   */
  initializeQuery(geography) {
    return this.setProperties({
      countrySelection: geography,
      countryData: null,
      queryError: null,
      loadingDetails: true,
    });
  },

  /**
   * Allow the user to hide the query results from their last query by clearing
   * the selections, query preview and response data.
   */
  clearQuery() {
    this.setProperties({
      countrySelection: null,
      currentQuery: null,
      countryData: null
    });
  }
});
