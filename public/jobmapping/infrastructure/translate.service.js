'user strict';

angular.module('hg')
.config(['$translateProvider',
  function($translateProvider) {
    var subDirectory = '';
    if(window.userApplication){
      subDirectory = window.userApplication + '/';
    }
    $translateProvider.useStaticFilesLoader({
        prefix: 'languages/' + subDirectory,        //Use languages/release/ if using the gulp language combination task
        suffix: '.json'
    });
    /*$translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: 'languages/{part}/{lang}.json'
    });*/
    $translateProvider.preferredLanguage('en');
    $translateProvider.fallbackLanguage('en');
  }
]);
