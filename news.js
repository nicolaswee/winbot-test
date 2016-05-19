var request = require('request')

module.exports = function (token) {
    return new News(token)
}

function News(token) {
    var self = this
    self.token = token
    self.get = function (topic, fn) {
        console.log(topic + "4");
//        var params = {
//            // Request parameters
//            "q": topic,
//            "count": "10",
//            "offset": "0",
//            "mkt": "en-us",
//            "safeSearch": "Moderate",
//        };
//      
//        $.ajax({
//            url: "https://bingapis.azure-api.net/api/v5/news/search?" + $.param(params),
//            
//            beforeSend: function(xhrObj){
//                // Request headers
//                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key",self.token);
//            },
//            type: "GET",
//            // Request body
//            data: "{body}",
//        })
//        .done(function(data) {
//            console.log(data+'5');
//            var topicName = data.value[0].name
//            console.log(topicName+'test');
//            fn(null, topicName)
//        })
//        .fail(function() {
//            return fn(error)
//        });
//    };
        var options = {url: "https://bingapis.azure-api.net/api/v5/news/search?q=" + topic + "&count=3&offset=0&mkt=en-us&safeSearch=Moderate",
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
            //console.log(data+"5");
//        var finaldata = JSON.parse(data);
//        var topicName = data.value[0].name
//        var topicLink = data.value[0].url
//        console.log(topicName);
//        console.log(topicLink);
            fn(null, data)
        })
    }
}
