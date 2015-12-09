app.controller('calibrateCtrl', function($scope, $stateParams, Estimote, $ionicHistory) {

    $scope.measuredRSSI = 0;
    $scope.beacon = Estimote.db[$stateParams.beaconId];

    var listener = $scope.$on('rangedBeacons', function (event, data) {
        console.log("ranged beacons", data.beacons);
        $scope.measuredRSSI = Estimote.db[$stateParams.beaconId].rssi;
        $scope.$apply();
    });

    $scope.beaconId = $stateParams.beaconId;

    $scope.calibrating = false;

    $scope.startCalibration = function () {
        $scope.calibrating = true;
    };

    $scope.calibrateBeacon = function () {
        listener(); // deregister Event
        Estimote.addCalibration($scope.beacon, $scope.measuredRSSI, "beacon");
        $scope.calibrating = false;
        $ionicHistory.goBack();
    };
})
