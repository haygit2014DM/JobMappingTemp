var util = {};



/********************************************************************************************************************************/
/********************************************************************************************************************************/
/***************                                                                                                  ***************/
/***************                                        General functionality                                     ***************/
/***************                                                                                                  ***************/
/********************************************************************************************************************************/
/********************************************************************************************************************************/

util.replace = function(str, find, replacement){
  if(!str){ return str; }
  return str.replace(new RegExp(find, 'g'), replacement);
};
//like util.props except in-place and only in an object (not an array)
util.scrub = function(obj, propNames){
  var backup = {};
  for(var p2 in propNames){ backup[propNames[p2]] = obj[propNames[p2]]; }
  for(var p1 in obj){ obj[p1] = undefined; }
  for(var p3 in propNames){ obj[propNames[p3]] = backup[propNames[p3]]; }
};
util.last = function(array){
  if(!array){ return undefined; }
  return array[array.length - 1];
};
util.isArray = function(obj){
  if(!obj){ return false; }
  var type = typeof(obj);
  if(type === 'array'){ return true; }
  if(type === 'object' && (obj.length !== undefined) && obj.slice){ return true; }
  return (Object.prototype.toString.call(obj) === '[object Array]');
};
var inLookup = function(obj, lookup){
  var found = undefined;  //jshint ignore:line
  _.each(lookup, function(item){
    if(item.key == obj){  //jshint ignore:line
      found = item.value;
    }
  });
  return found;
};
util.first = function(array, func){
  return _.filter(array, func)[0];
};
//empties an array
util.clear = function(array){
  array.splice(0, array.length);
};
//moves something within an array (in-place)
util.move = function(array, fromIndex, toIndex){
  var item = array.splice(fromIndex, 1)[0];
  array.splice(toIndex, 0, item);
};
util.validString = function(str){
  return (str && str.length > 0);
};
util.file = function(jsonFilename){
  var deferred = $q.defer();
  $.getJSON(jsonFilename).then(function(data){
    deferred.resolve(data);
  });
  return deferred.promise;
};



/********************************************************************************************************************************/
/********************************************************************************************************************************/
/***************                                                                                                  ***************/
/***************                                        Print functionality                                       ***************/
/***************                                                                                                  ***************/
/********************************************************************************************************************************/
/********************************************************************************************************************************/

var write = function(str){
  var ie9 = (window.navigator.userAgent.toLowerCase().indexOf('msie 9.') !== -1);
  if(ie9){
    try{
      if(console){ console.log(str); }
      else{ /*alert(str);*/ }
    }
    catch(e){
      //alert(str);
    }
  }
  else{
    console.log(str);
  }
};
var simpleToString = function(obj){
  if(!obj){ return ('' + obj); }
  if(typeof(obj) === 'object'){
    try{
      return JSON.stringify(obj);
    }
    catch(e){
      return '\'(object Object)\'';
    }
  }
  if(typeof(obj) === 'string'){
    return ('"' + obj.toString() + '"');
  }
  else{ return obj.toString(); }
};
util.toString = function(obj, iteration, noFunctions){
  if(typeof(obj) === 'string'){
    return '"' + obj + '"';
  }
  else if(util.isArray(obj)){
    if(obj.length === 0){ return '[]'; }
    var strs = [];
    if(iteration < 3){
      _.each(obj, function(item){ strs.push(util.toString(item, iteration + 1, noFunctions)); });
    }
    else{
      _.each(obj, function(item){ strs.push(simpleToString(item)); });
    }
    return ('[' + strs.join(', ') + ']');
  }
  else if(iteration < 3){
    if(typeof(obj) === 'object'){
      var oStr = '{';
      for(var prop in obj){
        if(typeof(obj[prop]) !== 'function'){
          if(oStr !== '{'){ oStr += ', '; }
          oStr += prop + ': ' + util.toString(obj[prop], iteration + 1, noFunctions);
        }
        else if(!noFunctions){
          if(oStr !== '{'){ oStr += ', '; }
          oStr += prop + ': ' + obj[prop];
        }
      }
      return (oStr + '}');
    }
    else{
      return simpleToString(obj);
    }
  }
  else{
    try{
      return simpleToString(obj);
    }
    catch(e){
      return util.shallowStringify(obj);
    }
  }
};
util.log = function(obj, obj2, obj3, obj4, obj5){
  var args = [obj, obj2, obj3, obj4, obj5];
  var totalStr = '';
  _.each(args, function(o){
    if(o){
      if(totalStr !== ''){ totalStr += '    '; }
      totalStr += util.toString(o, 0);
    }
  });
  write(totalStr);
};
//for debugging when JSON.stringify errors due to a cycle
util.shallowLog = function(obj){
  console.log(util.shallowStringify(obj));
};
util.shallowStringify = function(obj){
  var ret = '{';
  for(var prop in obj){
    if(typeof(obj[prop]) !== 'function'){
      if(ret !== '{'){ ret += ', '; }
      ret += prop + ': ' + simpleToString(obj[prop]);
    }
  }
  ret += '}';
  return ret;
};



/********************************************************************************************************************************/
/********************************************************************************************************************************/
/***************                                                                                                  ***************/
/***************                                         Date functionality                                       ***************/
/***************                                                                                                  ***************/
/********************************************************************************************************************************/
/********************************************************************************************************************************/

util.datetime = function(){
  var date = new Date();
  var str = '';
  str += (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
  var hours = date.getHours();
  var amPm = 'AM';
  if(hours >= 12){
    amPm = 'PM';
    if(hours > 12){ hours -= 12; }
  }
  if(hours === 0){ hours = 12; }
  var minutes = date.getMinutes().toString();
  if(minutes.length === 1){ minutes = '0' + minutes; }
  str += ', ' + hours + ':' + minutes + ' ' + amPm;
  return str;
};



/********************************************************************************************************************************/
/********************************************************************************************************************************/
/***************                                                                                                  ***************/
/***************                                         Copying functionality                                    ***************/
/***************                                                                                                  ***************/
/********************************************************************************************************************************/
/********************************************************************************************************************************/

var deepCopy = function(obj, lookup){
  if(!obj){ return obj; }
  if(util.isArray(obj)){
    var found1 = inLookup(obj, lookup);
    if(found1){ return found1; }
    
    var ret1 = [];
    for(var prop1 in obj){
      ret1[prop1] = deepCopy(obj[prop1], lookup);
    }
    lookup.push({key: obj, value: ret1});
    return ret1;
  }
  else if(typeof(obj) === 'object'){
    var found2 = inLookup(obj, lookup);
    if(found2){ return found2; }
    
    var ret2 = {};
    for(var prop2 in obj){
      ret2[prop2] = deepCopy(obj[prop2], lookup);
    }
    lookup.push({key: obj, value: ret2});
    return ret2;
  }
  else{
    return obj;
  }
};
//performs a deep copy. Don't call if the object contains a cycle
util.deepCopy = function(obj){
  var lookup = [];
  return deepCopy(obj, lookup);
};
//a shallow copy
util.copy = function(obj){
  if(util.isArray(obj)){ return util.copyArray(obj); }
  var ret = {};
  for(var prop in obj){ ret[prop] = obj[prop]; }
  return ret;
};