app.controller('statsCtrl', function($scope, Estimote, Settings, $http) {
    var settings = Settings.settings;
    $scope.iterations = [];
    $scope.myDistances = [];
    $scope.materialDistances = [];
    $scope.done = false;
    var id = 0;
    var agent = $scope.$on('rangedBeacons', function (event, data) {
        var obj = angular.extend({}, Estimote.db["401_1"], {index: id++});
        $scope.iterations.push(obj);
        $scope.myDistances.push(Estimote.distanceFromCalibration(Estimote.db["401_1"].rssi, Estimote.db["401_1"].calibration));
        $scope.materialDistances.push(Estimote.db["401_1"].distance);
        if($scope.myDistances.length >= parseInt(settings.STATS_SIZE)){
            $scope.done = true;
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

    /**
     * Returns true if my distance calculation is more precise than material
     * @param  {double} mat Material distance
     * @param  {double} cal Calibrated distance
     * @return {boolean}    mat > cal
     */
    $scope.diffBool = function (mat, cal, ref) {
        if(!ref) ref = 1;
        // Si on a en materiel 1.2m et en calibré 0.9m
        // -> 1 - 1.2 = 0.2
        // -> 1 - 0.9 = 0.1
        // 0.2 / 0.1 = 2x plus précis
        var matDiff = Math.abs(ref - mat);
        var calDiff = Math.abs(ref - cal);

        return matDiff >= calDiff;

    };

    /**
     * Returns precision in percentage of material precision
     * @param  {double} mat Material distance
     * @param  {double} cal Calibrated distance
     * @return {boolean}    mat > cal
     */
    $scope.diffPerc = function (mat, cal, ref) {
        if(!ref) ref = 1;
        // Si on a en materiel 1.2m et en calibré 0.9m
        // -> 1 - 1.2 = 0.2
        // -> 1 - 0.9 = 0.1
        // 0.2 / 0.1 = 2x plus précis
        var matDiff = Math.abs(ref - mat);
        var calDiff = Math.abs(ref - cal);
        var perc = matDiff/calDiff * 100;
        return perc.toFixed(2);

    }

    $scope.send = function () {
        var ip = prompt("Please enter IP of server:", settings.REMOTE_IP);
        if(ip){
            host = 'http://' + ip + ':8888/stats/stats.php';
            Settings.set('REMOTE_IP', ip);
            console.log("WILL SEND TO ", host);
            angular.forEach($scope.iterations, function (val, key) {
                setTimeout(function () {
                    console.log("Sending iteration n° " + key);
                    $http.post(host, {
                        beacon_id: val.uniqueName,
                        material_val: $scope.materialDistances[key],
                        my_val: $scope.myDistances[key],
                        success: $scope.diffBool(val.distance, $scope.myDistances[key]) ? 1 : 0,
                        precision: $scope.diffPerc(val.distance, $scope.myDistances[key])
                    })
                    .then(function (res) {
                        console.log(res.data);
                    });
                }, 500);
            });

        } else {
            alert("No ip");
        }
    }

    $scope.reset = function () {
        $scope.done = false;
        $scope.myDistances = [];
        $scope.materialDistances = [];
        $scope.iterations = [];
        agent = $scope.$on('rangedBeacons', function (event, data) {
            $scope.iterations.push(Estimote.db["401_1"]);
            $scope.myDistances.push(Estimote.distanceFromCalibration(Estimote.db["401_1"].rssi, Estimote.db["401_1"].calibration));
            $scope.materialDistances.push(Estimote.db["401_1"].distance);
            if($scope.myDistances.length >= parseInt(settings.STATS_SIZE)){
                $scope.done = true;
                agent();
            }
        });
    };
    $scope.myDistance = Estimote.distanceFromCalibration;
    $scope.format = Estimote.formatDistance;
});
