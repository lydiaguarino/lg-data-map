import Ember from 'ember';

export default Ember.Controller.extend({
  /**
   * The injected sparqler service.
   *
   * @property sparqler
   * @type Service Object
   */
  sparqler: Ember.inject.service('sparqler'),

  /**
   * An abbreviated sparqler service alias for use in templates
   *
   * @property s
   * @type Service Object
   */
  s: Ember.computed.alias('sparqler'),

  /**
   * A display toggle to show and hide the query options menu
   *
   * @property showOptions
   * @type Boolean
   * @default false
   */
  showOptions: false,

  /**
   * A stringified representation of the returned JSON query response
   * used for displaying the raw results to the user.
   *
   * @property countryDataString
   * @type String
   */
  countryDataString: Ember.computed('sparqler.countryData', function(){
    let data = JSON.stringify(this.get('sparqler.countryData'));
    return data;
  }),

  actions: {
    /**
     * button action to show and hide the options menu
     */
    toggleDropdown() {
      this.toggleProperty('showOptions');
    },

    /**
     * button action to clear the current query data
     */
    resetQuery() {
      let sparqler = this.get('sparqler');
      sparqler.clearQuery();
    },

    /**
     * Action handler to catch selection actions emitted from
     * the map component. This is the primary trigger for the
     * sparqler service and associated query requests.
     */
    countrySelectionChanged(geography) {
      let sparqler = this.get('sparqler');
      sparqler.buildQuery(geography);
    }
  }
});
