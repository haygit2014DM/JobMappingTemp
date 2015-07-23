angular.module('hg.jobMapping').config(['$routeProvider',
  function($routeProvider){
    
    $routeProvider.
    
      when('/jobmapping/login', {
        templateUrl: 'source/pages/auth/login.html',
        controller: 'JobMappingLoginCtrl'
      }).
      when('/jobmapping', {
        templateUrl: 'source/pages/index.html',
        controller: 'JobMappingCtrl',
      })
      
      //Example from Job Description
      /*
      //Dashboard
      when('/jobdescription/dashboard', {
        templateUrl: 'templates/myroles/dashboard/index.html',
        controller: 'DashboardCtrl',
        resolve: {
          metadata: ['DashboardService', function(DashboardService){
            return DashboardService.getMetadata();
          }],
          hasJobSaved: ['ScribeService', function(ScribeService){
            return ScribeService.hasJobDescSaved();
          }],
          gradingAccess: ['ScribeService', function(ScribeService){
            return ScribeService.hasGradingAccess();
          }],
          peopleAccess: function(){
            return true;
          }
        }
      })
      */
      
      //Error Page
      when('/jobmapping/error', {
        templateUrl: 'source/pages/error.html',
        controller: 'ErrorCtrl',
        resolve: {
        }
      }).
      
      otherwise({
        redirectTo: '/'
      });
      
  }
]);
