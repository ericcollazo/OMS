var app = angular.module('oms', []);
var socket = io.connect(window.location.origin);

app.controller('symbol-controller', function ($scope, $http) {

    $scope.symbols = [];

    angular.element(document).ready(function () {
        $scope.refresh();
    });

    socket.on('gridSend', function (data) {

        $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=' + data + '&callback=JSON_CALLBACK')
           .success(function(json)
           {
               var symbol = {
                   name: data,
                   price: json.LastPrice.toFixed(2),
                   delta: json.Change.toFixed(2),
                   deltap: json.ChangePercent.toFixed(2) + '%',
                   marketCap: json.MarketCap,
                   volume: json.Volume,
                   hlc: json.High.toFixed(2) + '/' + json.Low.toFixed(2) + '/' + json.Open.toFixed(2),
                   timestamp: json.Timestamp
               };
               $scope.symbols.push(symbol);
               $scope.$apply();
               console.log(json);
           })
           .error(function(msg)
           {
               console.log(msg);
           })
        });

    $scope.symbolAdd = function () {
        if ($scope.newSymbol) {

            $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=' + $scope.newSymbol + '&callback=JSON_CALLBACK')
               .success(function (json) {
                   if (json) {
                       socket.emit('gridAdd', json[0].Symbol);
                       $scope.newSymbol = "";
                       $scope.refresh();
                   }
               })
               .error(function (msg) {
                   console.log(msg);
               })
        }
    }

    $scope.removeSymbol = function (data) {
        socket.emit('gridRemove', data);
        $scope.refresh();
    }

    $scope.refresh = function () {
        $scope.symbols.length = 0;
        socket.emit('refreshGrid', 'go');
    };

});