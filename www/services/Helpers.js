app.service('Helpers', function ($rootScope, $localStorage) {

    this.randomNum = function(min, max, fix) {
        var num = Math.random() * (max - min + 1) + min;
        return fix ? Math.floor(num) : num;
    };

    this.median = function (values) {
        values.sort( function(a,b) {return a - b;} );

        var half = Math.floor(values.length/2);

        if(values.length % 2)
            return values[half];
        else
            return (values[half-1] + values[half]) / 2.0;
    };

    this.avg = function (values, decimals) {
        var sum = 0;
        for (i = 0; i < values.length; i++) {
            sum += values[i];
        }
        var avg = sum / values.length;
        return decimals ? avg.toFixed(decimals) : parseInt(avg);
    };

    this.variance = function (array, decimals) {
        if(!decimals) decimals = 4;
        var len = array.length,
            sum = 0;

        for(var i=0;i<array.length;i++)
        {
            sum += parseFloat(array[i]);
        }

        var mean = sum / len;
        if(len > 1){

            var v = 0;

            for(var i=0;i<array.length;i++)
            {
                v += (array[i] - mean) * (array[i] - mean);
            }
            v = v/len;

            return v.toFixed(decimals);

        } else {
            return 0;
        }

    }


});
