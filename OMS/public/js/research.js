var app = angular.module('oms', []);
var socket = io.connect(window.location.origin);

app.controller('symbol-controller', function ($scope, $http) {

    $scope.symbols = [];

    angular.element(document).ready(function () {
        $scope.refresh();
    });

    socket.on('gridSend', function (data) {
        $scope.$evalAsync(
            function ($scope) {
                $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=' + data + '&callback=JSON_CALLBACK')
                   .success(function (json) {
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

                       var found = false;

                       $.each($scope.symbols, function () {
                           if (this.name == symbol.name) {
                               this.price = symbol.price;
                               this.delta = symbol.delta;
                               this.deltap = symbol.deltap;
                               this.marketCap = symbol.marketCap;
                               this.volume = symbol.volume;
                               this.hlc = symbol.hlc;
                               this.timestamp = symbol.timestamp;
                               found = true;
                               return false;
                           }
                       });

                       if (!found) { $scope.symbols.push(symbol); };

                       $(".form-control-static").addClass("timestamp_live");
                       setTimeout(function () { $(".form-control-static").removeClass("timestamp_live") }, 3000);

                       console.log(json);
                   })
                   .error(function (msg) {
                       console.log(msg);
                   })
            }
           );
    });

    $scope.symbolAdd = function () {
        if ($scope.newSymbol) {
            $scope.$evalAsync(
                function ($scope) {
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
                });
        }
    }

    $scope.removeSymbol = function (data) {
        $scope.$evalAsync(
            function ($scope) {
                socket.emit('gridRemove', data);
                $scope.refresh();
            });
    }

    $scope.refresh = function () {
        $scope.$evalAsync(
            function ($scope) {
                $scope.symbols.length = 0;
                socket.emit('refreshGrid', 'go');
            });
    };

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