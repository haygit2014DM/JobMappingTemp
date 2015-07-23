//authentication service for the app access
angular.module('hg').factory('AuthService', ['HG',
  function(HG) {
    return {
      data: {},
      timeout: false,
      
      token: function(value){
        if(value){
          this.timeout = false;
          localStorage.setItem(HG.TOKEN_KEY, value);
        }
        return this.prop('token', value);
      },
      userId: function(value){
        if(value){
          this.timeout = false;
          localStorage.setItem(HG.USERID_KEY, value);
        }
        return this.prop('userId', value);
      },
      prop: function(key, value){
        if(!value){
          return this.data[key];
        }
        else{
          this.data[key] = value;
        }
      }
    };
  }
]);