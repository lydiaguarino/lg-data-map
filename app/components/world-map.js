import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  sparqler: Ember.inject.service('sparqler'),
  $mapObject: null,
  countrySelection: null,
  previousSelection: null,

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

  updateMapState(geography) {
    let previousSelection = this.get('countrySelection');
    this.setProperties({
      previousSelection: previousSelection,
      countrySelection: geography
    });
    return this.highlightActiveCountry(geography);
  },

  setupClickHandler(datamap, mapComponent) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      mapComponent.updateMapState(geography);
      return mapComponent.sendAction('countrySelectionChanged', geography);
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

  willDestroyElement() {
    this._super(...arguments);
    Ember.$('.datamaps-subunit').off('click');
  }
});
