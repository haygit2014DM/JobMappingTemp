angular.module('hg')
.controller('FooterCtrl', ['$scope', '$modal',
  function($scope, $modal){
    
    /*
    $scope.languagePath = 'us';///////////////
    function openModal(thisUrl, titleText){
      var instance = $modal.open({
        templateUrl: 'templates/share/footer.modal.html',
        controller: 'FooterModalCtrl',
        windowClass:'footer-modal',
        //backdrop: 'static',
        //keyboard: false,
        scope: $scope,
        resolve: {
          urlPath: function(){ return thisUrl; },
          titleText: function(){ return titleText; }
        }
      });
    }
    $scope.about = function(){
      openModal('https://www.haygroup.com/' + $scope.languagePath + '/about/ .main-content', 'AboutHayGroup');
    };
    $scope.privacy = function(){
      openModal('https://www.haygroup.com/' + $scope.languagePath + '/misc/privacy-policy.aspx .main-content', 'PrivacyPolicy');
    };
    $scope.terms = function(){
      openModal('https://www.haygroup.com/' + $scope.languagePath + '/misc/terms-of-service.aspx .main-content', 'TermsConditions');
    };
    
    $scope.logout = function(){
      window.top.location.href = '/#/logout';
    };
    */
    
  }
]);
