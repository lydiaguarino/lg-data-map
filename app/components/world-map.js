import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  classNames: ['row'],
  countrySelection: null,
  countrySelectionName: Ember.computed.alias('countrySelection.properties.name'),

  highlightActiveCountry: function(geography){
    let selectorString = '.datamaps-subunit.' + geography.id;
    Ember.run.once(function(){
      //TODO: fix repaint issue
      //There is a rendering bug with this code. Occasionally the class will be
      //correctly removed, but the SVG element will remain highlighted
      $('.datamaps-subunit').attr('class', function(index, classNames) {
        return classNames.replace('active', '');
      });
      $(selectorString).attr('class', function(index, classNames) {
        return classNames + ' active';
      });
    });
  },

  createNewMap() {
    let mapComponent = this;
    return new Datamap({
      element: document.getElementById('world-map-container'),

      geographyConfig: {
        highlightFillColor: '#f07464',
        highlightBorderColor: '#fff',
        highlightBorderWidth: 1
      },

      done: function(datamap) {
        datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
          mapComponent.set('countrySelection', geography);
          mapComponent.highlightActiveCountry(geography);
        });
      }
    });
  },

  didInsertElement() {
    this.createNewMap();
  }
});
