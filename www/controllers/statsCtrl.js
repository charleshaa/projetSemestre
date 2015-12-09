app.controller('statsCtrl', function($scope, Estimote, Settings) {
    var settings = Settings.settings;
    $scope.iterations = [];
    $scope.myDistances = [];
    $scope.materialDistances = [];
    var agent = $scope.$on('rangedBeacons', function (event, data) {
        $scope.iterations.push(Estimote.db["401_1"]);
        $scope.myDistances.push(Estimote.distanceFromCalibration(Estimote.db["401_1"].rssi, Estimote.db["401_1"].calibration));
        $scope.materialDistances.push(Estimote.db["401_1"].distance);
        if($scope.myDistances.length >= parseInt(settings.STATS_SIZE)){
            agent();
        }
    });


    $scope.avg = function (numbers) {
        var sum = 0;
        for (i = 0; i < numbers.length; i++) {
            sum += numbers[i];
        }
        var avg = sum / numbers.length;
        return avg;
    };

    $scope.reset = function () {
        $scope.myDistances = [];
        $scope.materialDistances = [];
        $scope.iterations = [];
        agent = $scope.$on('rangedBeacons', function (event, data) {
            $scope.iterations.push(Estimote.db["401_1"]);
            $scope.myDistances.push(Estimote.distanceFromCalibration(Estimote.db["401_1"].rssi, Estimote.db["401_1"].calibration));
            $scope.materialDistances.push(Estimote.db["401_1"].distance);
            if($scope.myDistances.length >= parseInt(settings.STATS_SIZE)){
                agent();
            }
        });
    };
    $scope.myDistance = Estimote.distanceFromCalibration;
    $scope.format = Estimote.formatDistance;
});
