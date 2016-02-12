var app = angular.module('oms', []);
var socket = io.connect(window.location.origin);

app.controller('symbol-controller', function ($scope, $http) {

    $scope.symbols = [];
    $scope.trade = [];
    $scope.lookUps = [];
    
    angular.element(document).ready(function () {
        $scope.refresh();
    });

    socket.on('gridSend', function (data) {
        $scope.$evalAsync(
            function ($scope) {
                $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=' + data + '&callback=JSON_CALLBACK')
                   .success(function (json) {
                       var symbol = {
                           symbol: data,
                           name: json.Name,
                           price: json.LastPrice.toFixed(2),
                           delta: json.Change.toFixed(2),
                           deltap: json.ChangePercent.toFixed(2) + '%',
                           marketCap: json.MarketCap,
                           volume: json.Volume,
                           hlc: json.High.toFixed(2) + '/' + json.Low.toFixed(2) + '/' + json.Open.toFixed(2),
                           timestamp: json.Timestamp,
                           newSymbol: true
                       };

                       var found = false;

                       $.each($scope.symbols, function () {
                           if (this.symbol == symbol.symbol) {
                               this.price = symbol.price;
                               this.delta = symbol.delta;
                               this.deltap = symbol.deltap;
                               this.marketCap = symbol.marketCap;
                               this.volume = symbol.volume;
                               this.hlc = symbol.hlc;
                               this.timestamp = symbol.timestamp;
                               this.newSymbol = symbol.newSymbol;
                               found = true;
                               return false;
                           }
                       });

                       if (!found) { $scope.symbols.push(symbol); };

                       $(".form-control-static").addClass("timestamp_live");
                       setTimeout(function () { $(".form-control-static").removeClass("timestamp_live") }, 3000);

                       $(".panel-title").addClass("timestamp_live");
                       setTimeout(function () { $(".panel-title").removeClass("timestamp_live") }, 3000);

                       console.log(json);
                   })
                   .error(function (msg) {
                       console.log(msg);
                   })
            }
           );
    });

    $scope.symbolLookUp = function () {
        if ($scope.newSymbol) {
            $scope.$evalAsync(
                function ($scope) {
                    $http.jsonp('http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=' + $scope.newSymbol + '&callback=JSON_CALLBACK')
                       .success(function (json) {
                           if (json) {
                               $scope.lookUps = json;
                               $scope.apply;
                               $('#lookUpModal').modal('show')
                           }
                       })
                       .error(function (msg) {
                           console.log(msg);
                       })
                });
        }
    }

    $scope.addSymbol = function(data){
        $scope.$evalAsync(
            function ($scope) {
                $('#lookUpModal').modal('hide')
                socket.emit('gridAdd', data);
                $scope.newSymbol = "";
                $scope.refresh();
        });        
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

    $scope.togglePanel = function($event, symbol){
        $scope.$evalAsync(
            function ($scope) {
                $("#chartDemoContainer").remove();
                $('#collapse'+symbol).append("<div id='chartDemoContainer'></div>");
                new Markit.InteractiveChartApi(symbol, 3650);
        });
    };
});