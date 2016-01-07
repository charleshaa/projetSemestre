app.service('Settings', function ($rootScope, $localStorage) {
    this.defaults = {
        FAKE_INTERVAL: 1,
        REFRESH_RATE: 3,
        SAMPLE_SIZE: 3,
        NORM_METHOD: 'avg',
        STATS_SIZE: 10,
        REMOTE_IP: '10.246.2.239'
    };

    this.settings = $localStorage.settings || this.defaults;

    this.save = function () {
        $localStorage.settings = this.settings;
    }.bind(this);

    this.set = function (key, val) {
        this.settings[key] = val;
        this.save();
    }.bind(this);

    this.get = function (key) {
        return this.settings[key];
    }.bind(this);

});
