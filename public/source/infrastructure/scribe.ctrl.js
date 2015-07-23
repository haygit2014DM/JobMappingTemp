'user strict';

/*
 * Why we have this odd controller here?
 *   The only reason is the user is logged in through Activate app (Backbone), we don't
 *   want to re-auth the current user
 */
angular.module('hg.scribe.controllers')
.controller('ScribeCtrl', ['$scope', '$rootScope', '$location', '$route', 'AlertService', 'HG', 'AuthService', 'AuthHttp', '$modalStack',
    'utilService', 'BrowserService', '$translate', 'ScribeService', //'$translatePartialLoader',
  function($scope, $rootScope, $location, $route, AlertService, HG, AuthService, AuthHttp, $modalStack, utilService, BrowserService, $translate,
      ScribeService/*, $translatePartialLoader*/){

    $rootScope.$on('$locationChangeSuccess', function(){
      if($modalStack.getTop()){ // this only for handling user clicked back button while the modal is open
        $modalStack.dismissAll('Browser\'s back button clicked!');
      }
      //ScribeService.resizeEvent();
      //ScribeService.navigateAwayEvent(null);
      ScribeService.navigateAwayEvent(null);    //if you've just navigated, disable this prompt
    });
    
    $scope.isIPad = BrowserService.iPad || BrowserService.tablet;
    
    $scope.alertService = AlertService;
    
    
    // TODO:
    //    1. Mobile broswer might turn off the localStorage support(private mode)
    //    2. Older browsers
    var authToken = localStorage.getItem(HG.TOKEN_KEY);
    var userId = localStorage.getItem(HG.USERID_KEY);
    
    //set language
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
      //$translatePartialLoader.addPart('jobdescription');
      //$translatePartialLoader.addPart('share');
    }
    else{
      $translate.use('en');
      //$translatePartialLoader.addPart('jobdescription');
      //$translatePartialLoader.addPart('share');
    }
    //utilService.superloop(function(){ $translate.refresh(); }, 2000);
    
    //utilService.log(authToken);
    //utilService.log(userId);
    
    // if we find a stored authToken and userId, this might from the activate app,
    // we have to grab the user roles to decide if current user is a
    // HG admin or a customer level admins(super_admin or admin)
    
    if (authToken && userId) {
      AuthService.token(authToken);
      var url = HG.BASE_API_URL + HG.API_VERSION + HG.USERS_URI + '/' + userId;
      //console.log('SCRIBE CTRL CALLING ' + url);
      AuthHttp.get(url).success(function(res){
        var data = res.data;
        // if(!data.roles || !data.roles[0]){
          // AlertService.setTranslatedError('AuthNoPermission');
          // return;
        // }
        
        if(!data){
          utilService.log('No data from server');
          $location.path('/jobdescription/login');
        }
        else{
          ScribeService.hideHeaderAndFooter();
          
          AuthService.token(authToken);
          AuthService.userId(userId);
          AuthService.gatekeepers(data.gateKeepers);
          //console.log(url);
          //if(url.toLowerCase().indexOf('login') !== -1){
          
          AuthService.firstName(res.data.firstName);
          AuthService.lastName(res.data.lastName);
          
          var currentPath = $location.absUrl();
          if(currentPath.toLowerCase().indexOf('#/jobdescription') === -1){
            var path = '/jobdescription/dashboard';
            $location.path(path);
            $route.reload();
            }
          //}
        }
      }).error(function(reason){
        //console.log('ScribeCtrl FAILED to get url ' + url);
        //console.log(reason);
        utilService.log('Server error: ' + (reason ? JSON.stringify(reason) : ''));
        $location.path('/jobdescription/login');    //$location.path()    //window.location =       //try window.top.location.href =
        
        //console.log('AUTHENTICATION ERROR: ' + JSON.stringify(reason));
        //alert('!!!!!!!!!!!!!!!! ERROR !!!!!!!!!!!!!!!!!    ' + reason);
        //$location.path('/jobdescription/login');
        //document.location = 'https://activate.haygroup.com/#/';
        //$location.path('/');
        //setTimeout(function(){ window.location = '/'; }, 1000);
      });
    }
    else{
      //console.log('No auth token or no user id');
      
      $location.path('/');
    }
    
  }
]);
