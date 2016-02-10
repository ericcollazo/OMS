var app = angular.module('oms', []);
var socket = io();

app.controller('trade-controller', function ($scope, $http) {
    $scope.trade = [];

    $('#tradeModal').on('show.bs.modal', function (event) {
        $scope.$evalAsync(
            function ($scope) {
                var button = $(event.relatedTarget)
                var symbol = button.data('symbol')

                $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=' + symbol + '&callback=JSON_CALLBACK')
               .success(function (json) {
                   var trade = {
                       name: symbol,
                       price: json.LastPrice.toFixed(2),
                   };
                   $scope.trade = trade;
               })
            });
    });
});