var graderApp = angular.module('graderApp', [
'ngRoute',
'graderController'
]);
 
graderApp.config(['$routeProvider',
function($routeProvider) {
$routeProvider.
when('/home', {
templateUrl: 'template/home.html',
controller: 'homeCtrl'
}).
when('/problem', {
templateUrl: 'template/problem.html',
controller: 'problemCtrl'
}).
when('/problem/:id', {
templateUrl: 'template/problem-id.html',
controller: 'problemidCtrl'
}).
when('/scoreboard', {
templateUrl: 'template/scoreboard.html',
controller: 'scoreboardCtrl'
}).
when('/result', {
templateUrl: 'template/result.html',
controller: 'resultCtrl'
}).
when('/admin/user', {
templateUrl: 'template/admin-user.html',
controller: 'adminUserCtrl'
}).
when('/admin/problem', {
templateUrl: 'template/admin-problem.html',
controller: 'adminProblemCtrl'
}).
when('/admin/problem/:id', {
templateUrl: 'template/admin-problem-id.html',
controller: 'adminProblemIdCtrl'
}).
when('/admin/testcase', {
templateUrl: 'template/admin-testcase.html',
controller: 'adminTestcaseCtrl'
}).
when('/admin/testcase/:id', {
templateUrl: 'template/admin-testcase-id.html',
controller: 'adminTestcaseIdCtrl'
}).
otherwise({
redirectTo: '/home'
});
}]);

var graderController = angular.module('graderController', []);
 
graderController.controller('homeCtrl', ['$scope', '$http',
function ($scope, $http) {
}]);
 
graderController.controller('problemCtrl', ['$scope', '$http',
function($scope, $http) {
    $http.get('problem').success(function(data) {
        $scope.problems = data;
    });
}]);

graderController.controller('problemidCtrl', ['$scope', '$routeParams','$http',
function($scope, $routeParams,$http) {
    $http.get('problem/'+$routeParams.id).success(function(data) {
        $scope.detail = data;
    });
}]);
graderController.controller('scoreboardCtrl', ['$scope','$http',
function($scope,$http) {
    $http.get('scoreboard').success(function(data) {
        var board = {};
        var problems = {};
        var score = {};
        var count = {};
        for(var i in data)
        {
            if(typeof(board[data[i][0]])== 'undefined')board[data[i][0]] ={};
            if(typeof(score[data[i][0]])=='undefined')score[data[i][0]]=0;
            if(typeof(count[data[i][0]])=='undefined')count[data[i][0]]=0;
            count[data[i][0]]+=(data[i][2])?1:0;		
            score[data[i][0]]+=data[i][2];
            problems[data[i][1]] = null;
            board[data[i][0]][data[i][1]] = [data[i][2],(data[i][2])?"#66FF66":"#FF5050"];
        }
        var users = Object.keys(score);
	   for(var i in users)
    	{
    		i = users[i];
    		score[i] = -1000000*count[i]+score[i];
    	}
    	var sortable = [];
        for (var vehicle in score)sortable.push([vehicle, score[vehicle]]);
        sortable.sort(function(a, b) {return a[1] - b[1]});
    	$scope.score  = sortable;
        $scope.board = board;
        $scope.problems =problems;
    });
}]);


graderController.controller('resultCtrl', ['$scope','$http',
function($scope,$http) {
    $scope.currentPage = 0;
    $scope.reloadData =  function() {
        $http.get('result/'+$scope.currentPage).success(function(data) {
            $scope.result = data;
        });
    };
    //reverse order
    $scope.nextPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
        $scope.reloadData();
    };
    
    $scope.prevPage = function () {
        if ($scope.result.length > 0) {
            $scope.currentPage++;
        }
        $scope.reloadData();
    };
    $scope.reloadData();
}]);

graderController.controller('adminUserCtrl', ['$scope','$http','$route',
function($scope,$http,$route) {
    $http.get('admin/user').success(function(data) {
        $scope.users = data;
    });
    $scope.delUser = function(uid){
        $http.delete('admin/user/'+uid).success(function(data){
            $route.reload();
        });
    }
}]);

graderController.controller('adminProblemCtrl', ['$scope','$http',
function($scope,$http) {
    $http.get('problem').success(function(data) {
        $scope.problems = data;
    });
}]);

graderController.controller('adminProblemIdCtrl', ['$scope','$http','$routeParams',
function($scope,$http,$routeParams) {
    $scope.probId = $routeParams.id;
}]);

graderController.controller('adminTestcaseCtrl', ['$scope','$http',
function($scope,$http) {
    $http.get('problem').success(function(data) {
        $scope.problems = data;
    });
}]);

graderController.controller('adminTestcaseIdCtrl', ['$scope','$http','$routeParams',
function($scope,$http,$routeParams) {
    $http.get('admin/testcase/'+$routeParams.id).success(function(data) {
        $scope.testcases = data;
    });
}]);
