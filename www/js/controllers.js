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

.controller('beaconsCtrl', function($scope, Estimote) {
    $scope.beacons = Estimote.getDb();
});
