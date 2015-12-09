app.controller('beaconsCtrl', function($scope, Estimote) {
    $scope.beacons = Estimote.getDb();
    $scope.deleteCache = Estimote.destroy;

});
