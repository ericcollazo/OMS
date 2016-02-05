var app = angular.module('oms', []);
var socket = io();

app.controller('symbol-controller', function ($scope) {
    
    //$scope.symbols = socket
    $scope.symbolAdd = function () {
        socket.emit('grid', $scope.newSymbol);
        $scope.newSymbol = "";
    }
    $scope.refresh = function () {
    };
});