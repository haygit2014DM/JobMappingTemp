'user strict';

/*
 * Why we have this odd controller here?
 *   The only reason is the user is logged in through Activate app (Backbone), we don't
 *   want to re-auth the current user
 */
angular.module('hg.scribe.controllers')
.controller('ScribeCtrl', ['$scope', '$rootScope', '$location', '$route', 'AlertService', 'HG', 'AuthService', 'AuthHttp', '$modalStack',
    'utilService', 'BrowserService', '$translate', 'JobMappingService', //'$translatePartialLoader',
  function($scope, $rootScope, $location, $route, AlertService, HG, AuthService, AuthHttp, $modalStack, utilService, BrowserService, $translate,
      JobMappingService/*, $translatePartialLoader*/){

    $rootScope.$on('$locationChangeSuccess', function(){
      if($modalStack.getTop()){ // this only for handling user clicked back button while the modal is open
        $modalStack.dismissAll('Browser\'s back button clicked!');
      }
      ScribeService.navigateAwayEvent(null);    //if you've just navigated, disable this prompt
    });
    
    $scope.isIPad = BrowserService.iPad || BrowserService.tablet;
    
    $scope.alertService = AlertService;
    
    var authToken = localStorage.getItem(HG.TOKEN_KEY);
    var userId = localStorage.getItem(HG.USERID_KEY);
    
    var locale = localStorage.getItem(HG.LOCALE_KEY);
    if(locale){
      var jsonFiles = ['en', 'zh', 'de'];       //prod: 'en'
      if(_.some(jsonFiles, function(j){ return (j === locale); })){
        $translate.use(locale);
        AuthService.locale(locale);
      }
      else{
        $translate.use('en');
      }
    }
    else{
      $translate.use('en');
    }
    
    if (authToken && userId) {
      AuthService.token(authToken);
      var url = HG.BASE_API_URL + HG.API_VERSION + HG.USERS_URI + '/' + userId;
      
      AuthHttp.get(url).success(function(res){
        var data = res.data;
        
        if(!data){
          utilService.log('No data from server');
          $location.path('/jobmapping/login');
        }
        else{
          JobMappingService.hideHeaderAndFooter();
          
          AuthService.token(authToken);
          AuthService.userId(userId);
          AuthService.prop('gatekeepers', data.gateKeepers);
          
          AuthService.prop('firstName', res.data.firstName);
          AuthService.prop('firstName', res.data.lastName);
          
          var currentPath = $location.absUrl();
          if(currentPath.toLowerCase().indexOf('#/jobMapping') === -1){
            var path = '/jobMapping/index';
            $location.path(path);
            $route.reload();
          }
        }
      }).error(function(reason){
        utilService.log('Server error: ' + (reason ? JSON.stringify(reason) : ''));
        $location.path('/jobMapping/login');
      });
    }
    else{
      $location.path('/');
    }
    
  }
]);
