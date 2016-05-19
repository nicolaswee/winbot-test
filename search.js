var request = require('request')

module.exports = function (token) {
    return new Search(token)
}

function Search(token) {
    var self = this
    self.token = token
    self.get = function (topic, fn) {
        console.log(topic + "4");
        var options = {url: "https://bingapis.azure-api.net/api/v5/search/?q=" + topic + "&count=3&offset=0&mkt=en-us&safeSearch=Moderate",
            headers: {
                'Ocp-Apim-Subscription-Key': self.token
            }
        };
        request(options, function (error, response, data) {
            if (error) {
                return fn(error)
            }
            if (response.statusCode !== 200) {
                return fn(new Error('unexpected status ' + response.statusCode))
            }
            fn(null, data)
        })
    }
}
