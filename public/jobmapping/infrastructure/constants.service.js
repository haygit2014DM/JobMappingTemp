var localEnvironment;



//localEnvironment = 'Dev';
//localEnvironment = 'Dev-Int';
localEnvironment = 'Test';
//localEnvironment = 'Production';
//localEnvironment = 'Staging 1';
//localEnvironment = 'Staging 2';
//localEnvironment = 'Staging 3';
//localEnvironment = 'Staging 4';
//localEnvironment = 'Proxy';


var environmentNames = ['Dev', 'Dev-Int', 'Test', 'Production', 'Staging 1', 'Staging 2', 'Staging 3', 'Staging 4', 'Proxy'];
var environmentUrls =  ['http://10.10.205.21', 'https://leap.haygroup.com:7150', 'https://leap.haygroup.com', 'https://activate.haygroup.com',
                        'http://10.10.204.21', 'http://10.10.204.22', 'http://10.10.204.23', 'http://10.10.204.24', 'http://localhost:3001/api'];

var thisEnvironmentName = 'Production';                    //by default
var thisEnvironmentUrl = 'https://activate.haygroup.com';  //by default

if(localEnvironment){
  for(var i = 0; i < environmentUrls.length; i++){
    if(environmentNames[i] === localEnvironment){
      thisEnvironmentName = environmentNames[i];
      thisEnvironmentUrl = environmentUrls[i];
      break;
    }
  }
}
else{
  for(var i = 0; i < environmentUrls.length; i++){
    var split = environmentUrls[i].split('/');
    var urlBase = split[split.length - 1];
    if(window.location.href.indexOf(urlBase) !== -1){
      thisEnvironmentName = environmentNames[i];
      thisEnvironmentUrl = environmentUrls[i];
      break;
    }
  }
}

/*  */
angular.module('hg')
.constant('HG', {
  AUTH_TOKEN: 'authToken',
  
  // for the localStorage
  TOKEN_KEY: 'HayGroup.User.authToken',
  USERID_KEY: 'HayGroup.User.id',
  LOCALE_KEY: 'currentLng',
  
  ADMIN_LAST_URL: 'HayGroup.Last.url',
  
  DEPLOY: !localEnvironment,
  BASE_API_URL: thisEnvironmentUrl,
  ENVIRONMENT: thisEnvironmentName
  
});
