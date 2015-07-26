angular.module('hg')
.factory('BrowserService', ['$filter',
  function($filter){
    return {
      badBrowser: function(){
      },
      lessThanIdealBrowser: function(){
      }
    };
  }
]);
