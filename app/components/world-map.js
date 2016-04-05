import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  countrySelection: null,
  countrySelectionName: Ember.computed.alias('countrySelection.properties.name'),
  classNames: ['row'],
  didInsertElement() {
    let self = this;
    let worldMap = new Datamap({
      element: document.getElementById('world-map-container'),
      geographyConfig: {
        highlightFillColor: '#f07464',
        highlightBorderColor: '#fff',
        highlightBorderWidth: 1
      },
      done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
          self.set('countrySelection', geography);
        });
      }
    });
  }
});
