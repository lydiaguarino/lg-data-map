import Ember from 'ember';
import Datamap from 'npm:datamaps';

export default Ember.Component.extend({
  /**
   * A reference to the jQuery datamap object
   *
   * @property $mapObject
   * @type jQuery Object
   * @default null
   */
  $mapObject: null,

  /**
   * The currently selected geography object.
   *
   * @property countrySelection
   * @type Object
   * @default null
   */
  countrySelection: null,

  /**
   * The previously selected geography object.
   *
   * @property countrySelection
   * @type Object
   * @default null
   */
  previousSelection: null,

  /**
   * When the user clicks a country, highlight it as active. Update the previous
   * country fill to show that it has already been visited.
   */
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

  /**
   * When the user clicks a country, capture and handle the geography data.
   */
  updateMapState(geography) {
    let previousSelection = this.get('countrySelection');
    this.setProperties({
      previousSelection: previousSelection,
      countrySelection: geography
    });
    return this.highlightActiveCountry(geography);
  },

 /**
   * Once the map has rendered, add click handlers to emit an action to the
   * parent application scope and provide the user with visual feedback that
   * a country element was clicked.
   */
  setupClickHandler(datamap, mapComponent) {
    datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
      mapComponent.updateMapState(geography);
      return mapComponent.sendAction('countrySelectionChanged', geography);
    });
  },

  /**
   * Once the application has loaded, initialize the datamaps jQuery component.
   */
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

  /**
   * Ember lifecycle hook to delay DOM manipulation until it is ready.
   */
  didInsertElement() {
    this._super(...arguments);
    return this.initializeMap();
  },

  /**
   * Ember lifecycle hook to tear down jQuery event listeners when the component
   * is destroyed.
   */
  willDestroyElement() {
    this._super(...arguments);
    Ember.$('.datamaps-subunit').off('click');
  }
});
