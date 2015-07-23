function create(moduleName){

  //on top of $http
  angular.module(moduleName).factory('AuthHttp', ['$http', 'AuthService', '$q',
    function($http, AuthService, $q) {
      var authHttp = {};

      // Append the right header to the request
      var extendHeaders = function(config) {
        config.headers = config.headers || {};
        config.headers[AuthService.tokenKey()] = AuthService.token();
      };

      // Do this for each $http call
      angular.forEach(['get', 'delete', 'head', 'jsonp'], function(name) {
        authHttp[name] = function(url, config) {
          config = config || {};
          extendHeaders(config);
          return $http[name](url, config);
        };
      });

      angular.forEach(['post', 'put'], function(name) {
        authHttp[name] = function(url, data, config) {
          config = config || {};
          extendHeaders(config);
          return $http[name](url, data, config);
        };
      });
      
      authHttp.requestID = 0;
      //for parametrized invocation
      //arguments after method and url are optional
      authHttp.call = function(method, url, data, description, successFunc, userHeaders, bWrapWithID, bDisableCache){
        data = (data === null ? undefined : data);
        var userConfig = {'headers': userHeaders ? userHeaders : undefined};
        if(bDisableCache && method === 'get'){
          userHeaders['Pragma'] = 'no-cache';
          userHeaders['Cache-Control'] = 'no-cache';
          
          var hasParams = (url.indexOf('?') !== -1);
          if(hasParams){ url += '&'; }
          else{ url += '?'; }
          url += '_=' + (new Date().getTime());
        }
        
        var deferred = $q.defer();
        var currentRequestID = authHttp.requestID;
        authHttp.requestID++;    //unique ID so that we know which response is coming back, in case they come back out of order
        var call = data ? authHttp[method](url, data, userConfig) : authHttp[method](url, userConfig);
        call.success(
              function(res, status, headers, config){
                var data = res.data;
                //if(data === undefined || data === null && res.responseMessage){ data = res.responseMessage; }   //no- this breaks existing code checking if data exists!
                if(successFunc){ successFunc(data); }
                deferred.resolve(bWrapWithID ? {data: data, id: currentRequestID} : data);
              })
            .error(
              function(res, status, headers, config){
                if(description){ deferred.reject('Service error: failed to ' + description); }
                else{ deferred.reject('Service error'); }
              });
        return (bWrapWithID ? {data: deferred.promise, id: currentRequestID} : deferred.promise);
      };
      
      return authHttp;
    }
  ]);
}