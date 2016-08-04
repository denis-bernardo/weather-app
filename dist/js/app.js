var URL = 'http://api.openweathermap.org';
var APPID = '3d11dabb5d4596ed7b404b94d1001134';

var GEO_API = 'http://www.geonames.org';
var GEO_USER = 'denisbernardo02';

moment.locale('pt_br');

Vue.filter('ceil', function (value) {
    return Math.ceil(value);
});

Vue.filter('formatDate', function (value) {
    return moment(value).format('LLLL');
});

var app = new Vue({
    el: '#app',
    data: {
        current: '',
        weather: '',
        minTemp: 0,
        maxTemp: 0,
        averageTemp: 0,
        minTemps: [],
        maxTemps: [],
        averageTemps: [],
        weekends: [],
        states: '',
        state: 'PR',
        cities: '',
        city: 'Londrina'
    },
    methods:{
        initSlider: function () {
            $('.weather-slider').slick({
                slidesToShow: 3,
                slidesToScroll: 3,
                prevArrow: '<i class="slick-prev fa fa-chevron-circle-left"></i>',
                nextArrow: '<i class="slick-next fa fa-chevron-circle-right"></i>',
                infinite: false
            });
        },
        destroySlider: function() {
            $('.weather-slider').slick('unslick');
        },
        initChart: function() {
            new Morris.Line({
                // ID of the element in which to draw the chart.
                element: 'weather-chart',
                // Chart data records -- each entry in this array corresponds to a point on
                // the chart.
                data: this.averageTemps,
                // The name of the data record attribute that contains x-values.
                xkey: 'day',
                // A list of names of data record attributes that contain y-values.
                ykeys: ['temp'],
                // Labels for the ykeys -- will be displayed when you hover over the
                // chart.
                labels: ['temp'],
                resize: true
            });
        },
        getLowestTemp: function (array) {
            Array.min = function( array ){
                return Math.min.apply( Math, array );
            };

            var min = Array.min(array);
            return min;
        },
        getHighestTemp: function (array) {
            Array.max = function( array ){
                return Math.max.apply( Math, array );
            };

            var max = Array.max(array);
            return max;
        },
        getCities: function (e) {

            var self = this;

            self.$http.get(GEO_API + '/childrenJSON?geonameId='+ self.state +'&username=' + GEO_USER).then(function(response) {
                self.cities = response.data;
            });
        },
        getWeather: function() {
            var self = this;

            self.$http.get(URL + '/data/2.5/weather?q=' + self.city + '&APPID=' + APPID + '&units=metric').then(function(response) {
                self.current = response.data;
            });

            self.$http.get(URL + '/data/2.5/forecast?q=' + self.city + '&APPID=' + APPID + '&units=metric').then(function(response){
                self.weather = response.data;

                $.each(self.weather.list, function(key, value){
                    self.minTemps.push(value.main.temp_min);
                    self.maxTemps.push(value.main.temp_max);
                    self.averageTemps.push({day: value.dt_txt, temp: value.main.temp});

                    switch(moment(value.dt_txt).format('dddd')) {
                        case 'Sexta-feira':
                        case 'Sábado':
                        case 'Domingo':
                            if (moment(value.dt_txt).format('LT') == '12:00') {
                                self.weekends.push({
                                    day: moment(value.dt_txt).format('dddd'),
                                    temp: value.main.temp,
                                    condition: value.weather[0].description,
                                    icon: value.weather[0].icon
                                });
                                break;
                            }
                    }

                });

                self.minTemp = self.getLowestTemp(self.minTemps);
                self.maxTemp = self.getHighestTemp(self.maxTemps);

                self.initChart();

                window.setTimeout(function(){
                    self.initSlider();
                }, 1000);

            });
        },
        changeCity: function () {
            var self = this;

            self.weekends = [];
            self.minTemps = [];
            self.maxTemps = [];
            self.averageTemps = [];

            $('#weather-chart').remove();

            $('.weather-chart-content').append('<div id="weather-chart"></div>');

            self.destroySlider();
            self.getWeather();
        }
    },
    ready: function() {
        var self = this;

        self.$http.get(GEO_API + '/childrenJSON?geonameId=3469034&username=' + GEO_USER).then(function(response) {
            self.states = response.data;
        });

        self.getWeather();
    }
});