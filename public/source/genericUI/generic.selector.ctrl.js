angular.module('hg')
.controller('GenericSelectorCtrl', ['$scope', '$modalInstance', 'entryList', 'keyName', 'displayFunc', 'submitFunc', 'text',
  function($scope, $modalInstance, entryList, keyName, displayFunc, submitFunc, text){
    //$scope.settings = settings;
    $scope.entryList = entryList;
    $scope.keyName = keyName;
    $scope.displayFunc = displayFunc;
    $scope.submitFunc = submitFunc;
    $scope.text = text;
    //$scope.settings.result = {};
    /*$scope.settings.closeModal = function(data){
      if(data === 'cancel'){
        $modalInstance.dismiss('cancel');
      }
      else{
        $modalInstance.close(data);
      }
    };*/
    
    $scope.inputData = {query: ''};
    $scope.dropdownModel = {selectedVal: ''};
    $scope.typed = function(){
      var query = $scope.inputData.query;
      //$scope.settings.result.selectedEntry = undefined;
      if(!query || query.length === 0) { $scope.entriesAutocompleted = undefined; return null; }
      var lower = query.toLowerCase();
      $scope.entriesAutocompleted =
        _.filter($scope.entryList, function(e){ return ($scope.displayFunc(e).toLowerCase().indexOf(lower) !== -1); });
      $scope.enableConfirm();
    };
    $scope.$watch('dropdownModel.selectedVal', function(){
      $scope.enableConfirm();
    });
    $scope.enableConfirm = function(){
      if($scope.confirmEnabled === undefined){
        $scope.confirmEnabled = false;
      }
      else{
        $scope.confirmEnabled = true;
      }
    };
    $scope.showEntries = function(){
      return ($scope.selectedUser === undefined);
    };
    $scope.selectEntryVal = function(entry){
      //$scope.settings.result.selectedEntry = entry;
      $scope.inputData.query = $scope.displayFunc(entry);
    };

    $scope.confirm = function(){
      /*if($scope.dropdownModel.selectedVal && $scope.dropdownModel.selectedVal.length > 0){
        $scope.settings.result.selectedEntry = ($scope.settings.decode ? $scope.settings.decode($scope.dropdownModel.selectedVal) : {});
        if($scope.settings.keyName){ $scope.settings.result.selectedEntry[$scope.settings.keyName] = $scope.dropdownModel.selectedVal; }
      }*/
      var finalVal = $scope.submitFunc($scope.dropdownModel.selectedVal);
      if(finalVal.then){
        finalVal.then(function(res){ $modalInstance.close(res); });
      }
      else{
        $modalInstance.close(finalVal);
      }
    };
    $scope.cancel = function(){
      $modalInstance.dismiss('cancel');
    };
  }
]);
