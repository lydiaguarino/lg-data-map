import Ember from 'ember';

export function largeNum(params) {
  if(params[0]){
    let formattedNum = params[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedNum;
  }
}

export default Ember.Helper.helper(largeNum);
