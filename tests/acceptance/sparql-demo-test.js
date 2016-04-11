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
        return click('.spec-query-toggle-menu');
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
        let component = App.__container__.lookup('')
      });

      beforeEach(function(done) {
        return setTimeout(function(){
          done();
        }, 1000);
      });


      it("builds and displays a query", function() {
        debugger;
        expect($('.spec-query-preview').text()).to.equal(
          `SELECT * WHERE {
 ?x a dbo:Country.
 ?x rdfs:label "China"@en.
 ?x dbp:commonName ?name.
 OPTIONAL {?x dbo:populationTotal ?pop}.
       }`);
      });

    });

  });
});
