angular.module('hg')
.config(['$httpProvider',
  function ($httpProvider) {
    if(!$httpProvider.defaults.headers.get){
        $httpProvider.defaults.headers.get = {};
    }
    /*if(window.navigator.userAgent.toLowerCase().indexOf('msie 10.') !== -1){
      //console.log('IE10');
      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }*/
    ////$httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

    $httpProvider.interceptors.push('noCacheHttpInterceptor');
    $httpProvider.responseInterceptors.push('errorHttpInterceptor');
  }
])

// noCache interceptor, the name is not true, just for IE10 for now
// but this has side effects, be caution...
.factory('noCacheHttpInterceptor', ['$window',
  function ($window) {
    return {
      request: function (config){
        var ie9 = ($window.navigator.userAgent.toLowerCase().indexOf('msie 9.') !== -1);
        var ie10 = ($window.navigator.userAgent.toLowerCase().indexOf('msie 10.') !== -1);
        if((ie9 || ie10) && config.url.indexOf('template/') === -1 && config.url.indexOf('templates/') === -1){
          if(config.method === 'GET'){
            var separator = config.url.indexOf('?') === -1 ? '?' : '&';
            config.url = config.url + separator + 'noCache=' + (new Date()).getTime();     //IE query string
          }
        }
        return config;
      }
    };
  }
])

// error interceptor
.factory('errorHttpInterceptor', ['$q','$location', '$rootScope', 'AlertService', 'HG', 'AuthService', 'PageService',
  function ($q, $location, $rootScope, AlertService, HG, AuthService, PageService){
    return function (promise) {
      return promise.then(function (response) {
        //AlertService.clear();
        return response;
      }, function (response){
        var app = null;
        var thisUrl = window.location.pathname;
        if(thisUrl.toLowerCase().indexOf('jobdescription') !== -1){ app = 'Job Description'; } 
        else if(thisUrl.toLowerCase().indexOf('admin') !== -1){ app = 'Configuration'; }
        
        var win = window.top;
        var msg;
        if(!window.disableErrorIntercepter){
          if(response.status === 401){
            var url = '/';
            if(!HG.DEPLOY){   // this is for the UI local dev       //window.top.angular
              var match = $location.url().match(/^\/\w*/);
              var absUrl = $location.absUrl();
              var reg = new RegExp(match + '/');
              var idx = absUrl.search(reg);
              url = absUrl.substring(0, idx) + match + '/login';
            }
            win.location.href = url;
            util.log('Unauthorized access; redirecting to ' + url);
            AuthService.timeout = true;
          }
          else if(response.status === 403){
            msg = response.data.responseMessage || '';
            AlertService.setErrorPageError(msg);
            if(app === 'Job Description'){
              var newTarget;
              if(PageService.mostRecentPage() === 'Error'){
                 newTarget = '/jobdescription.html#/jobdescription/dashboard';
              }
              else{
                newTarget = '/jobdescription.html#/jobdescription/error';
              }
              if(HG.DEPLOY){ newTarget = '/hgApps' + newTarget; }
              win.location.href = newTarget;
            }
            /*else if(app === 'Configuration'){
            }*/
            else{
              msg = response.data.responseMessage || '';
              AlertService.setError(msg);
            }
          } 
          else if(response.status >= 400 && response.status <= 500){
            msg = response.data.responseMessage || '';
            AlertService.setError(msg);
          }
        }
        return $q.reject(response);
      });
    };
  }
]);