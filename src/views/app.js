let socket = io();

angular.module('myapp', [])
.factory('DataService', function ($http) {
    return {
        getConfig: function() {
            return $http.get('/getconfig');
        },
        getNodes: function(id) {
            return $http.get('/nodes/'+id);
        }        
    }
})
.controller('OpcuaController', function($scope, DataService) {
	let self = this;
	
	$scope.allnodes = [];
	$scope.nodes = [];

	$scope.headline = 'OPC UA Adapter';
    $scope.checkedItems = [];

    $scope.getNodes = (id) => {
    	console.log('get config for '+id);
		DataService.getNodes(id).then(function(res) {
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
    }

    $scope.$watch('nodes', () => {
    	console.log($scope.nodes);
    	socket.emit('nodes', {
    		id: 0,
    		nodes: $scope.nodes
    	});
    }, true);

    socket.on('message', (msg) => {
    	$scope.$apply(() => {
	    	$scope.message = msg;
    		console.log($scope.message);
    	});
    });

    socket.on('data', (msg) => {
    	$scope.$apply(() => {
    		console.log(msg);
    	});
    });

	DataService.getConfig().then(function(res) {
		console.log('getConfig');
		console.log(res);
		$scope.config = res.data;
	});

})



  