angular.module('hg')
.controller('GenericIncludeCtrl', ['$scope', '$modalInstance', 'conflicts', 'displayEntryFunc', 'displayCurrentSettingFunc', 'submitFunc', 'text',
  function($scope, $modalInstance, conflicts, displayEntryFunc, displayCurrentSettingFunc, submitFunc, text){
    $scope.conflicts = [];
    _.each(conflicts, function(c){ $scope.conflicts.push({source: c, included: false}); });
    $scope.displayEntryFunc = displayEntryFunc;
    $scope.displayCurrentSettingFunc = displayCurrentSettingFunc;
    $scope.submitFunc = submitFunc;
    $scope.text = text;
    $scope.selectedConflictUsers = [];
    
    $scope.confirm = function(){
      var included = _.pluck(_.filter($scope.conflicts, function(c){ return c.included; }), 'source');
      var exluded = _.pluck(_.filter($scope.conflicts, function(c){ return !c.included; }), 'source');
      
      var finalVal = $scope.submitFunc(included, exluded);
      if(finalVal && finalVal.then){
        finalVal.then(function(res){ $modalInstance.close(res); });
      }
      else{
        $modalInstance.close(finalVal || 'Success');
      }
    };
    
    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
    };
    
  }
]);
