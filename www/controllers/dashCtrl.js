app.controller('dashCtrl', function($scope, Estimote, MYBEACONS) {
    $scope.count = 0;
    $scope.enabled = Estimote.enabled ? "Estimote service is enabled" : "Estimote service is disabled";
    $scope.networkType = Estimote.type;
    $scope.beacons = [];
    $scope.beaconDb = MYBEACONS;
    $scope.$on('rangedBeacons', function (event, data) {
        $scope.beacons = data.beacons;
        $scope.count++;
        $scope.$apply();
    });

    $scope.myDistance = Estimote.distanceFromCalibration;

    $scope.getBeacons = Estimote.getBeacons;
    $scope.formatDistance = Estimote.formatDistance;
});
