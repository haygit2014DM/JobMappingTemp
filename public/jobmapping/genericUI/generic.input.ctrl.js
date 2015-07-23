angular.module('hg')
.controller('GenericInputCtrl', ['$scope', '$modalInstance', '$filter', '$sce', 'text',
  function($scope, $modalInstance, $filter, $sce, text){
    $scope.text = text;
    $scope.labelText = $filter('translate')(text.label, text.labelParams);
    $scope.render = function(str){ return $sce.trustAsHtml(str); };
    
    $scope.model = {text: ''};
    
    $scope.ok = function(){
      $modalInstance.close($scope.model.text);
    };
    
    $scope.cancel = function() {
      $modalInstance.dismiss('cancelled');
    };
    
  }
]);
