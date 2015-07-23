angular.module('hg')
.controller('GenericConfirmationCtrl', ['$scope', '$modalInstance', '$filter', '$sce', 'text',
  function($scope, $modalInstance, $filter, $sce, text){
    $scope.text = text;
    $scope.labelText = $filter('translate')(text.label, text.labelParams);
    $scope.render = function(str){ return $sce.trustAsHtml(str); };
    
    $scope.confirm = function(){
      $modalInstance.close('Yes');
    };
    $scope.deny = function(){
      $modalInstance.close('No');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancelled');
    };
    
  }
]);
