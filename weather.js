var request = require('request')

module.exports = function(token){
    return new Weather(token)
}

function Weather (token){
    var self = this
    self.token = token
    
    self.get = function(location, fn){
        //console.log(location);
        var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '$units=metric&APPID='+self.token 
    request({url: url, json: true}, function(error, response, data){
        if(error){
            return fn(error)
        }
        if(response.statusCode !== 200){
            return fn(new Error('unexpected status ' + response.statusCode))
        }
        var currentConditions = data.weather[0].description
        var currentTemp = Math.round(data.main.temp-273.15) + '°C'
        var msg = 'The weather is *' + data.name + '* is *' + currentTemp + '* and *' + currentConditions + '*.'
        fn(null, msg)
    })
    }
}
