/**
 * Charles Haarman
 * Estimote service for managing beacons throughout the app. Events, helper functions, etc.
 */

app.service('Estimote', function ($rootScope, $filter, $timeout, $ionicPlatform) {

    this.formatDistance = function(meters)
	{
		if (!meters) { return 'Unknown'; }

		if (meters > 1)
		{
			return meters.toFixed(3) + ' m';
		}
		else
		{
			return (meters * 100).toFixed(3) + ' cm';
		}
	};

    var onRange = function (beaconInfo) {
        $rootScope.$broadcast('rangedBeacons', {beacons: beaconInfo.beacons});
    };

    var onError = function (errorMessage) {
        console.log("Got an error: " + errorMessage);
    };

    this.getClosestBeacon = function () {

    };

    if(!window.cordova){
        console.log("We are not on device, shutting down estimote service");
        this.enabled = false;
    } else {
        this.enabled = true;
        this.regions = [];
        this.beacons = [];


        console.log("We have the estimotes.");
        $ionicPlatform.ready(function () {
            console.log(estimote);
            console.log("PWAHAHA");
            estimote.beacons.requestAlwaysAuthorization();
            estimote.beacons.startRangingBeaconsInRegion(
                {}, // Empty region matches all beacons.
                onRange,
                onError);

        });

    }
});
