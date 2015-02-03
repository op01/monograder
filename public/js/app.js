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
when('/about', {
templateUrl: 'template/about.html',
controller: 'aboutCtrl'
}).
when('/problem', {
templateUrl: 'template/problem.html',
controller: 'problemCtrl'
}).
when('/problem/:id', {
templateUrl: 'template/problem-id.html',
controller: 'problemidCtrl'
}).
when('/result', {
templateUrl: 'template/result.html',
controller: 'resultCtrl'
}).
when('/admin/scoreboard', {
templateUrl: 'template/scoreboard.html',
controller: 'adminScoreboardCtrl'
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

graderApp.factory('httpRequestInterceptor', function () {
return {
request: function (config) {
config.url+= "?cache_fix="+Math.random().toString();
return config;
}
};
});
 
graderApp.config(function ($httpProvider) {
$httpProvider.interceptors.push('httpRequestInterceptor');
}); 

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

graderController.controller('resultCtrl', ['$scope','$http',
function($scope,$http) {
    $scope.currentPage = 0;
    $scope.modalCurrentCode = "";
    $scope.modalCurrentId = -1;
    $scope.showCode = function(i)
    {
        $scope.modalCurrentId = $scope.result[i][0];
        $http.get('src/'+$scope.modalCurrentId).success(function(data) {
            $scope.modalCurrentCode = data;
            $("#codeModal").modal();
            color("mycode",data);
        });
    }
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
graderController.controller('adminScoreboardCtrl', ['$scope','$http',
function($scope,$http) {
    $http.get('admin/scoreboard').success(function(data) {
        $scope.data =data;
    });
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
