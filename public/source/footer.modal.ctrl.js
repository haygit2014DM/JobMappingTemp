ngular.module('hg')
.controller('FooterModalCtrl', ['$scope', '$modalInstance', 'urlPath', 'titleText', 'BrowserService',
  function($scope, $modalInstance, urlPath, titleText, BrowserService){
    
    $scope.titleText = titleText;
    $scope.urlPath = urlPath;
    
    if(!BrowserService.ie){
      $.support.cors = true;
    }
    
    $(document).ready(function(){
      setTimeout(function(){
        $('#contentElement').load($scope.urlPath);
        //$('#contentElement').attr('src', $scope.urlPath);
      }, 500);
    });
    
    $scope.close = function(){
      $modalInstance.dismiss('cancelled');
    };
    
  }
]);
