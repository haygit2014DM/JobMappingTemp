angular.module('hg')
.controller('GenericFormCtrl', ['$scope', '$modalInstance', '$filter', '$sce', 'formHtml', 'text', 'responseFunc',
  function($scope, $modalInstance, $filter, $sce, formHtml, text, responseFunc){
    $scope.formHtml = formHtml;
    $scope.text = text;
    $scope.render = function(str){ return $sce.trustAsHtml(str); };
    
    function share(name, val){
      if(!(window.shared)){ window.shared = {}; }
      window.shared[name] = val;
    }
    share('responseFunc', responseFunc);
    
    $scope.confirm = function(){
      util.log('confirm');
      $modalInstance.close('confirmed');
    };
    
    $scope.cancel = function() {
      $modalInstance.dismiss('cancelled');
    };
  }
]);
