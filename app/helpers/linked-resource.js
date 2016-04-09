import Ember from 'ember';

export function linkedResource(params) {
  let segments =  params[0].split("/");
  return segments[segments.length - 1];
}

export default Ember.Helper.helper(linkedResource);
