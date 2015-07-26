'user strict';

/*
 * Why we have this odd controller here?
 *   The only reason is the user is logged in through Activate app (Backbone), we don't
 *   want to re-auth the current user
 */
angular.module('hg.jobMapping.controller')
.controller('JobMappingCtrl', ['$scope', 'dndLists', //'$translatePartialLoader',
  function($scope, dndLists){
  	
  	 $scope.models = {
        selected: null,
        lists: {"A": [], "B": []}
    };
    
    $scope.list = [
    	{label: 'snacks'},
    	{label: 'towels'}
    ];

    // Generate initial model
    for (var i = 1; i <= 3; ++i) {
        $scope.models.lists.A.push({label: "Item A" + i});
        $scope.models.lists.B.push({label: "Item B" + i});
    }

    // Model to JSON for demo purpose
    $scope.$watch('models', function(model) {
        $scope.modelAsJson = angular.toJson(model, true);
    }, true);
  }
]);