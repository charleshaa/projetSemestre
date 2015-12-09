angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, Estimote, MYBEACONS) {
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

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('calibrateCtrl', function($scope, $stateParams, Estimote, $ionicHistory) {

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

.controller('beaconsCtrl', function($scope, Estimote) {
    $scope.beacons = Estimote.getDb();
    $scope.deleteCache = Estimote.destroy;

})

.controller('statsCtrl', function($scope, Estimote, Settings) {
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
})

.controller('settingsCtrl', function($scope, Estimote, Settings) {

    $scope.settings = Settings.settings;
    $scope.saveSettings = Settings.save;

});
