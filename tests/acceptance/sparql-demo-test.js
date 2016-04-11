/* jshint expr:true */
import {
  describe,
  it,
  beforeEach,
  afterEach
} from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import Ember from 'ember';

describe('Acceptance: SparqlDemo', function() {
  // TODO: FIX ASYNC DESTROY ISSUES
  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    Ember.run(application, 'destroy');
  });

  describe("visiting the index route", function() {
    beforeEach(function() {
      return visit('/');
    });

    it("displays one and only one map", function() {
      expect($('svg.datamap').length).to.equal(1);
    });

    it("does not display the options dropdown", function() {
      expect($('.spec-query-menu').length).to.equal(0);
    });

    it("displays query instructions", function() {
      expect($('.spec-query-instructions').length).to.equal(1);
      expect($('.spec-query-instructions:contains("Click on a country")').length).to.equal(1);
    });

    describe("opening the query menu", function() {
      beforeEach(function() {
        click('.spec-query-toggle-menu');
      });

      it("displays the query menu", function() {
        expect($('.spec-query-menu').length).to.equal(1);
      });

      it("disables the name query option", function() {
        expect($('.spec-query-name input').prop('checked')).to.equal(true);
        expect($('.spec-query-name input').prop('disabled')).to.equal(true);
      });

      it("disables the resource query option", function() {
        expect($('.spec-query-resource input').prop('checked')).to.equal(true);
        expect($('.spec-query-resource input').prop('disabled')).to.equal(true);
      });

      it("initializes with the population query option selected", function() {
        expect($('.spec-query-pop input').prop('checked')).to.equal(true);
        expect($('.spec-query-pop input').prop('disabled')).to.equal(false);
      });
    });

    describe("clicking on China", function() {
      beforeEach(function() {
        let sparqler = application.__container__.lookup("service:sparqler");
        sparqler.buildQuery({id: 'CHN', properties: {name: "China"}});
      });

      it("builds and displays a query", function() {
        expect($('.spec-query-preview').text()).to.equal(
          `SELECT * WHERE {
 ?x a dbo:Country.
 ?x rdfs:label "China"@en.
 ?x dbp:commonName ?name.
 OPTIONAL {?x dbo:populationTotal ?pop}.
       }`);
      });

      it("displays an informative loading screen", function() {
        expect($('.spec-loading-modal:contains("China")').length).to.equal(1);
      });

    });

    describe("requesting a more complex query", function() {
      beforeEach(function() {
        click('.spec-query-toggle-menu');
      });

      beforeEach(function() {
        click('.spec-query-cur');
      });

      beforeEach(function() {
        let sparqler = application.__container__.lookup("service:sparqler");
        sparqler.buildQuery({id: 'CHN', properties: {name: "China"}});
      });

      it("builds and displays a query", function() {
        expect($('.spec-query-preview').text()).to.equal(
          `SELECT * WHERE {
 ?x a dbo:Country.
 ?x rdfs:label "China"@en.
 ?x dbp:commonName ?name.
 OPTIONAL {?x dbo:populationTotal ?pop}.
    OPTIONAL {?x dbo:currency ?cur}.
   }`);
      });
    });

    describe("handling the query response", function() {
      beforeEach(function() {
        let sparqler = application.__container__.lookup("service:sparqler");
        sparqler.handleSuccessfulQuery({results: { bindings:[{"x":{"type":"uri","value":"http://dbpedia.org/resource/China"},"name":{"type":"literal","xml:lang":"en","value":"the People's Republic of China"},"pop":{"type":"typed-literal","datatype":"http://www.w3.org/2001/XMLSchema#nonNegativeInteger","value":"1376049000"}}] }}, {id: 'CHN', properties: {name: "China"}});
      });

      it("hides the loading modal", function() {
        expect($('.spec-loading-modal:contains("China")').length).to.equal(0);
      });

      it("displays a success message", function() {
        expect($('.spec-status:contains("Republic of China")').length).to.equal(1);
      });

      it("displays the raw response text", function() {
        expect($('.spec-raw-response').text()).to.equal(
          `{"x":{"type":"uri","value":"http://dbpedia.org/resource/China"},"name":{"type":"literal","xml:lang":"en","value":"the People's Republic of China"},"pop":{"type":"typed-literal","datatype":"http://www.w3.org/2001/XMLSchema#nonNegativeInteger","value":"1376049000"}}`);
      });

      it("displays the formatted response data", function() {
        expect($('.spec-pop-response:contains("Population: 1,376,049,000")').length).to.equal(1);
      });
    });

  });
});
