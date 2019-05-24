let socket = io();

angular.module('myapp', [])
.factory('DataService', function ($http) {
    return {
        getNodes: function() {
            return $http.get('/nodes');
        }
    }
})
.controller('OpcuaController', function($scope, DataService) {
	let self = this;
	
	$scope.allnodes = [];
	$scope.nodes = [];

	$scope.headline = 'OPC UA Adapter';
    $scope.checkedItems = [];

    this.get = () => {
    	console.log();
    }

    $scope.$watch('nodes', () => {
    	console.log($scope.nodes);
    	socket.emit('nodes', $scope.nodes);
    }, true);

    socket.on('message', (msg) => {
    	$scope.$apply(() => {
	    	$scope.message = msg;
    		console.log($scope.message);
    	});
    });

	DataService.getNodes().then(function(res) {
		console.log(res.data);
		$scope.allnodes = res.data;
	    $("#tree").treeview({
	    	data: res.data,
	    	multiSelect: true,
	    	showCheckbox: true,
	    	showTags: true
	    });
	    $('#tree').on('nodeSelected', function(event, data) {
  			$scope.$apply(() => {
  				delete data.nodes ;
           		$scope.nodes.push(data);
	    		console.log($scope.headline, $scope.nodes);
	    	})
		});
	    $('#tree').on('nodeUnselected', function(event, data) {
  			$scope.$apply(() => {
  				delete data.nodes ;
	           	$scope.nodes.splice($scope.nodes.indexOf(data),1);
	    		console.log($scope.headline, $scope.nodes);
	    	})
		});
	});	

})



  