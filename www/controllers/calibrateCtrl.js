app.controller('calibrateCtrl', function($scope, $stateParams, Estimote, $ionicHistory, Helpers) {




    $scope.measuredRSSI = 0;
    $scope.variance = 0;
    $scope.beacon = Estimote.db[$stateParams.beaconId];

    $scope.values = [];

    var listener = $scope.$on('rangedBeacons', function (event, data) {
        console.log("ranged beacons", data.beacons);
        if($scope.calibrating){
            $scope.values.push(Estimote.db[$stateParams.beaconId].rssi);
            $scope.measuredRSSI = Helpers.avg($scope.values);
            $scope.variance = Helpers.variance($scope.values, 2);
            $scope.$apply();
        }
    });

    $scope.beaconId = $stateParams.beaconId;

    $scope.calibrating = true;

    $scope.startCalibration = function () {
        $scope.calibrating = true;
    };

    $scope.refresh = function () {
        $scope.values = [];
        $scope.measuredRSSI = 0;
        $scope.variance = 0;
    };

    $scope.calibrateBeacon = function () {
        listener(); // deregister Event
        Estimote.addCalibration($scope.beacon, $scope.measuredRSSI, "beacon");
        $scope.calibrating = false;
        $ionicHistory.goBack();
    };
})
