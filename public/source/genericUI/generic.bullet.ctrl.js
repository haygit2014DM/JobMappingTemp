angular.module('hg')
.controller('GenericBulletCtrl', ['$scope', '$modalInstance', '$filter', '$sce', 'text', 'bullets',
  function($scope, $modalInstance, $filter, $sce, text, bullets){
    $scope.text = text;
    $scope.labelText = $filter('translate')(text.label, text.labelParams);
    $scope.bullets = bullets;
    $scope.render = function(str){ return $sce.trustAsHtml(str); };
    
    $scope.confirm = function(){
      $modalInstance.close('Yes');
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancelled');
    };
    
  }
]);
