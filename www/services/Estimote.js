/**
* Charles Haarman
* Estimote service for managing beacons throughout the app. Events, helper functions, etc.
*/

app.service('Estimote', function($rootScope, $filter, $timeout, $ionicPlatform, MYBEACONS) {

    var FAKE_INTERVAL = 1000;
    var REFRESH_RATE = 3000;
    var SAMPLE_SIZE = 3;
    var NORM_METHOD = 'avg';

    this.beacons = {};
    this.stickers = {};
    this.distances = {};
    this.db = {};
    var refreshInterval;

    var normalizeDistances = function(distances) {
        if (!distances || distances.length < 0) return -1;
        switch (NORM_METHOD) {
            case "med": // Median
                distances.sort( function(a,b) {return a - b;} );

                var half = Math.floor(values.length/2);

                if(values.length % 2)
                    return values[half];
                else
                    return (values[half-1] + values[half]) / 2.0;
                break;
            case "avg": // Average
            default:
                console.log("LISSAGE DES DISTANCES", distances);
                var sum = 0;
                for (i = 0; i < distances.length; i++) {
                    sum += distances[i];
                }
                var avg = sum / distances.length;
                return avg;
                break;

        }
    };

    function randomNum(min, max, fix) {
        var num = Math.random() * (max - min + 1) + min;
        return fix ? Math.floor(num) : num;
    }

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

    this.formatDistance = function(meters) {
        if (!meters) {
            return 'Unknown';
        }

        if (meters > 1) {
            return meters.toFixed(3) + ' m';
        } else {
            return (meters * 100).toFixed(3) + ' cm';
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

    this.getClosestBeacon = function() {

    };

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
                "rssi": randomNum(-55, -40, true),
                "distance": randomNum(0, 100, false),
                "proximity": randomNum(0, 3, true)
            }, {
                "major": 17222,
                "proximityUUID": "B9407F30-F5F8-466E-AFF9-25556B57FE6D",
                "minor": 48261,
                "rssi": randomNum(-55, -40, true),
                "distance": randomNum(0, 100, false),
                "proximity": randomNum(0, 3, true)
            }]
        };
        return signal;
    };

    var pushData = function() {
        var payload = angular.copy(this.getBeacons());
        console.log("DISTANCES", JSON.stringify(this.distances));
        angular.forEach(payload, function(val, key) {
            if (this.distances[key]) payload[key].distance = normalizeDistances(this.distances[key]);
        });
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
        }, FAKE_INTERVAL);

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

                refreshInterval = setInterval(pushData, REFRESH_RATE);

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
