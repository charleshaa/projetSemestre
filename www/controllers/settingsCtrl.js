app.controller('settingsCtrl', function($scope, Estimote, Settings) {

    $scope.settings = Settings.settings;
    $scope.saveSettings = Settings.save;

});
