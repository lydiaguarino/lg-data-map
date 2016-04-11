# Lg-data-map

This is a demo of how to integrate SPARQL queries with the DBPedia semantic web data source. The goal of the project is to provide a simple user interface for building a limited scope query for retrieving data about a country.

## Live Demo
[lg-map-demo.pagefrontapp.com](https://lg-map-demo.pagefrontapp.com)

## Total time investment as of 4/10
30 hrs

## Libraries and Addons used
1. Datamaps
2. Ember CLI
2. Ember-CLI-mocha
3. Ember-Bootstrap
4. Ember-Font-Awesome
5. Ember-Pagefront

## Intended Demonstrated Skills
1. Understanding of Ember CLI, components, services and helpers
- Thoughtful UX Design aimed at instruction and experimentation
- Mocha acceptance testing
- Clean YUI-Doc style commenting
- BEM CSS class designations
- Datamaps jQuery plugin integration
- Basic SPARQL query construction
- DBPedia semantic web query integration
- End to end implementation understanding including pagefront deployment
- Refactoring skills

## Known issues 4/10
1. If the user clicks on a country and does not remove the mouse from the hover position, there is a race condition with the datamaps code that occasionally causes the selection highlighting to fail.
- There is an async race condition with the test suite that sporadically causes some tests to fail, siting an error related to attempting to set a property on a destroyed object. This is a common issue when integrating jQuery plugins with Ember and will require additional research to resolve. Tests run clean when run in isolation.
- The handy built in hover labels for the datamap are positioned under the mouse pointer on some screen sizes, preventing the user from clicking on a country. The tool tip labels have been disabled for this reason. Additional CSS tweaking will be needed to properly resolve this issue. It would be good to add this feature back so that the user can see the country name before clicking on the element.
- The DBPedia endpoint is http. The demo is deployed to https. This requires the user to enable insecure scripts to get the application to work. This needs further resolution. 
- The naming convention on the United States and a few other countries does not match between datamaps and DBPedia. This causes the query to return empty results for those countries. The correct way to fix this is to add a mapping for the mis-matched names. I have chosen to omit the map so that I have known failure points that can be used to demo error states.
- Additional edge case tests need to be added in addition to the existing happy path tests.
- It would be preferable to make the query directly editable by the user. This will require extensive validations. I have opted for a simplified means of making the query dynamic by allowing the user to select checkboxes for a limited number of known resource properties.
- Some queries return multiple results. The current code disregards all results other than the first returned record. This is for simplification purposes, but should be refined in future iterations.
- Missing public description, responsive headers, favicon, other release-ready polish details.

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`
* `bower install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)

