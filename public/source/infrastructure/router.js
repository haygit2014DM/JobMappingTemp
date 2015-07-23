angular.module('hg.jobMapping').config(['$routeProvider',
  function($routeProvider){
    
    $routeProvider.
    
      when('/jobdescription/login', {
        templateUrl: 'templates/myroles/auth/login.html',
        controller: 'ScribeLoginCtrl'
      }).
      when('/jobdescription', {
        templateUrl: 'templates/myroles/wizard/index.html',
        controller: 'ScribeCtrl',
      }).
      
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
      
      //Error Page
      when('/jobdescription/error', {
        templateUrl: 'templates/myroles/share/error.html',
        controller: 'ErrorCtrl',
        resolve: {
        }
      }).
      
      otherwise({
        redirectTo: '/'
      });
      
  }
]);
