import Ember from 'ember';

export default Ember.Controller.extend({
  sparqler: Ember.inject.service('sparqler'),
  s: Ember.computed.alias('sparqler'),
  showOptions: false,
  countryDataString: Ember.computed('sparqler.countryData', function(){
    let data = JSON.stringify(this.get('sparqler.countryData'));
    return data;
  }),

  actions: {
    toggleDropdown() {
      this.toggleProperty('showOptions');
    },
    resetQuery() {
      let sparqler = this.get('sparqler');
      sparqler.clearQuery();
    },
    countrySelectionChanged(geography) {
      let sparqler = this.get('sparqler');
      sparqler.buildQuery(geography);
    }
  }
});
