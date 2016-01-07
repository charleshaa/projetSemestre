/**
* Charles Haarman
* Estimote service for managing beacons throughout the app. Events, helper functions, etc.
*/

app.service('Estimote', function($rootScope, $filter, $timeout, $ionicPlatform, MYBEACONS, $localStorage, Settings, Helpers) {

    var settings = Settings.settings;

    this.beacons = {};
    this.stickers = {};
    this.distances = {};
    this.db = $localStorage.beaconDb || {};
    var refreshInterval;

    var normalizeDistances = function(distances) {
        if (!distances || distances.length < 0) return -1;
        switch (settings.NORM_METHOD) {
            case "med": // Median
                return Helpers.median(distances);
                break;
            case "avg": // Average
            default:
                return Helpers.avg(distances);
                break;

        }
    };



    // http://stackoverflow.com/questions/21338031/radius-networks-ibeacon-ranging-fluctuation
    var computeDistance = function(power, rssi) {
        if (rssi == 0 || !rssi) {
            return -1; // if we cannot determine accuracy, return -1.
        }

        var ratio = rssi / power;
        if (ratio < 1.0) {
            return Math.pow(ratio, 10);
        } else {
            var accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
            return accuracy / 10000000;
        }
    };


    this.save = function () {
        $localStorage.beaconDb = this.db;
    }.bind(this);

    this.distanceFromCalibration = function (txCalibratedPower, rssi) {
        if(!rssi || !txCalibratedPower) return -1;
        var ratio_db = rssi - txCalibratedPower;
        var ratio_linear = Math.pow(10, ratio_db / 10);

        var r = Math.sqrt(ratio_linear);
        return r;
    }.bind(this);

    this.formatDistance = function(meters) {
        if (!meters) {
            return 'Unknown';
        }

        if (meters > 1) {
            return meters.toFixed(2) + ' m';
        } else {
            return (meters * 100).toFixed(2) + ' cm';
        }
    };

    /**
    * Creates a unique name from major + minor
    * @param  {object} beacon Beacon for which to compute name
    * @return {string}        Name
    */
    var computeName = function(beacon) {
        return "" + beacon.major + "_" + beacon.minor;
    }

    /**
     * Adds a RSSI measured at one meter on beacons
     * @param {object}  beacon       beacon to measured
     * @param {int}     measuredRssi RSSI value at 1 meter
     * @param {string}  type         beacon/sticker
     */
    this.addCalibration = function (beacon, measuredRssi, type) {

        if(!type) type = "beacon";
        var name = beacon.uniqueName;
        console.log("Calibrating ", name);
        if(this.db[name]){
            console.log("We have it, added calibration", measuredRssi);
            this.db[name].calibration = measuredRssi;
            console.log(this.db[name]);
        } else {
            var obj = normalizeData(beacon, type);
            obj.calibration = measuredRssi;
            this.db[name] = obj;
        }
        console.log(this.db);
    };

    /**
    * Normalizes data between beacons and stickers
    * @param  {object} data Raw data from device
    * @param  {String} type stickers || beacons
    * @return {object}      normalized object
    */
    var normalizeData = function(data, type) {
        var d = new Date();
        if (type == 'beacons') {
            var uName = computeName(data);
            var obj = {
                uniqueName: uName,
                name: (MYBEACONS[uName]) ? MYBEACONS[uName].name : 'N/A',
                room: (MYBEACONS[uName]) ? MYBEACONS[uName].room : 'N/A',
                distance: data.distance,
                distanceFormatted: this.formatDistance(data.distance),
                lastSeen: d.toISOString(),
                rssi: data.rssi,
                color: data.color,
                calibration: (this.db[uName]) ? this.db[uName].calibration : undefined,
                deviceType: 'beacon'
            }
        } else if (type == 'stickers') {
            var id = data.identifier;
            var distance = computeDistance(data.power, data.rssi);
            var obj = {
                uniqueName: id,
                name: (MYBEACONS[id]) ? MYBEACONS[id].name : data.nameForType,
                room: (MYBEACONS[id]) ? MYBEACONS[id].room : 'N/A',
                distance: distance,
                distanceFormatted: this.formatDistance(distance),
                lastSeen: d.toISOString(),
                rssi: data.rssi,
                color: data.color,
                calibration: (this.db[id]) ? this.db[id].calibration : undefined,
                deviceType: 'sticker'
            }
        } else {
            return {};
        }
        return obj;
    }.bind(this);

    var onRange = function(data, type) {
        var bcs;
        if (type == "beacons") {
            bcs = angular.copy(data.beacons);
        } else if (type == 'stickers') {
            bcs = angular.copy(data);
        }

        bcs.sort(function(b1, b2) {
            return b1.rssi > b2.rssi;
        });

        angular.forEach(bcs, function(val, key) {
            var obj = normalizeData(val, type);
            bcs[key] = obj;
            if (type == 'beacons') {
                this.beacons[obj.uniqueName] = obj;
                if (this.distances[obj.uniqueName]) this.distances[obj.uniqueName].push(obj.distance)
                else this.distances[obj.uniqueName] = [obj.distance];
            }
            if (type == 'stickers') {
                this.stickers[obj.uniqueName] = obj;
                if (this.distances[obj.uniqueName]) this.distances[obj.uniqueName].push(obj.distance)
                else this.distances[obj.uniqueName] = [obj.distance];
            }
            this.db[obj.uniqueName] = obj;
            this.save();
        }.bind(this));

        return bcs;
    }.bind(this);

    var onError = function(errorMessage) {
        console.log("Got an error: " + errorMessage);
    };

    this.getBeacons = function() {
        return angular.extend({}, this.beacons, this.stickers);
    }.bind(this);

    this.getDb = function() {
        return this.db;
    }.bind(this);

    this.destroy = function () {
        delete $localStorage.beaconDb;
        this.db = {};
        this.beacons = {};
        this.stickers = {};
        this.distances = {};
        $rootScope.$broadcast('dbReset');
    }.bind(this);

    var generateBeaconSignal = function() {
        var signal = {
            "region": {
                "identifier": "EstimoteSampleRegion",
                "uuid": "B9407F30-F5F8-466E-AFF9-25556B57FE6D"
            },
            "beacons": [{
                "major": 401,
                "proximityUUID": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
                "minor": 1,
                "rssi": Helpers.randomNum(-55, -40, true),
                "distance": Helpers.randomNum(0, 100, false),
                "proximity": Helpers.randomNum(0, 3, true)
            }, {
                "major": 17222,
                "proximityUUID": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
                "minor": 48261,
                "rssi": Helpers.randomNum(-55, -40, true),
                "distance": Helpers.randomNum(0, 100, false),
                "proximity": Helpers.randomNum(0, 3, true)
            }]
        };
        return signal;
    };

    var pushData = function() {
        var payload = angular.copy(this.getBeacons());
        angular.forEach(payload, function(val, key) {
            if (this.distances[key]) payload[key].distance = normalizeDistances(this.distances[key]);
        }.bind(this));
        $rootScope.$broadcast('rangedBeacons', {
            beacons: payload
        });
        this.beacons = {};
        this.stickers = {};
    }.bind(this);

    if (!window.cordova) {
        console.log("We are not on device, We will generate fake beacons signals");
        this.enabled = true;
        this.type = "emulated";
        setInterval(function() {
            var sig = onRange(generateBeaconSignal(), 'beacons');
            $rootScope.$broadcast('rangedBeacons', {
                beacons: sig
            });
        }, settings.FAKE_INTERVAL * 1000);

    } else {
        this.enabled = true;
        this.type = "native";
        this.regions = [];

        this.bluetoothActive = false;

        console.log("We have the estimotes.");
        $ionicPlatform.ready(function() {
            estimote.beacons.requestAlwaysAuthorization();
            estimote.beacons.startRangingBeaconsInRegion({}, // Empty region matches all beacons.
                function(data) {
                    onRange(data, 'beacons');
                },
                onError);

                refreshInterval = setInterval(pushData, settings.REFRESH_RATE * 1000);

                var interval = setInterval(function() {
                    estimote.bluetoothState(function(result) {
                        console.log("Bluetooth: " + result);
                        if (result) {
                            this.bluetoothActive = true;
                            //clearInterval(interval);
                            estimote.nearables.startRangingForType(
                                estimote.nearables.NearableTypeAll,
                                function(nearables) {
                                    onRange(nearables, 'stickers');
                                    clearInterval(interval);
                                },
                                function(errorMessage) {
                                    console.log("ERROR: " + errorMessage);
                                });
                            }
                        }.bind(this), function(errorMessage) {
                            console.log('Bluetooth check error: ' + errorMessage);
                        });
                    }.bind(this), 200);

                });
            }
        });
