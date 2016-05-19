var Botkit = require('botkit');
var builder = require('botbuilder');

var openWeatherApiKey = "997684052093606682f0251a37e1d126";
var BingNewsApiKey = "2d98f7ca8d8d4f36937a7bae85d0ac66";
var BingSearchApiKey = "2d98f7ca8d8d4f36937a7bae85d0ac66";
var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: "xoxb-41185367776-N8rFrIeciJatvO09rsqAM7Jd"
});

var slackBot = new builder.SlackBot(controller, bot);
//slackBot.add('/', function (session) {
//   session.send('Hello World'); 
//});

//slackBot.add('/', new builder.CommandDialog()
//    .matches('^set name', builder.DialogAction.beginDialog('/profile'))
//    .matches('^quit', builder.DialogAction.endDialog())
//    .onDefault(function (session) {
//        if (!session.userData.name) {
//            session.beginDialog('/profile');
//        } else {
//            session.send('Hello %s!', session.userData.name);
//        }
//    }));
//slackBot.add('/profile', [
//    function (session) {
//        if (session.userData.name) {
//            builder.Prompts.text(session, 'What would you like to change it to?');
//        } else {
//            builder.Prompts.text(session, 'Hi! What is your name?');
//        }
//    },
//    function (session, results) {
//        session.userData.name = results.response;
//        session.send('Hello %s!', session.userData.name);
//        session.endDialog();
//    }
//]);

var dialog = new builder.LuisDialog('https://api.projectoxford.ai/luis/v1/application?id=eea38edc-5fc6-4526-aad7-6e50e61380e6&subscription-key=d1a87b4ec94141cda4f1481d1b7534eb')
slackBot.add('/', dialog)

var weather = require('./weather')(openWeatherApiKey)

dialog.setThreshold(0.5).on('weather', [
    function (session, args, next) {
        var countryObj = builder.EntityRecognizer.findEntity(args.entities, 'country')
        if (!countryObj) {
            builder.Prompts.text(session, 'I\'d love to give you the weather but for where?')
        } else {
            next({response: countryObj.entity})
        }
    },
    function (session, results) {
        country = results.response
        console.log(country);
        weather.get(country, function (error, msg) {
            if (error) {
                console.error(error)
                session.send("uh oh, there was a problem getting the weather")
            }
            session.send(msg)
        })
    }
])

var news = require('./news')(BingNewsApiKey)

dialog.on('newsTopic', [
    function (session, args, next) {
        var topicObj = builder.EntityRecognizer.findEntity(args.entities, 'newstopic')
//        topic = topicObj.entity
//        var dateObj = builder.EntityRecognizer.findEntity(args.entities, 'newsdate::today')
//        date = dateObj.entity
//        console.log(topic + "1")
//        console.log(date)
        if (!topicObj) {
            builder.Prompts.text(session, 'I\'d love to give you the news but on what topic? (Rephase the sentence)')
        } else {
            next({response: topicObj.entity})
        }
//        if(!date){
//            builder.Prompts.text(session, 'I\'d love to give you the weather but for where?')
//        }else{
//            next({responsedate: date })
//        }
    },
    function (session, results) {
//        date = results.responsedate
        //console.log(topic + "2");
        console.log(results.response + "2");
        topic = results.response
        news.get(topic, function (error, data) {
            if (error) {
                console.error(error)
                session.beginDialog("uh oh, there was a problem getting the news")
            }
            var finaldata = JSON.parse(data);
            //console.log(finaldata + "6");
            //console.log(finaldata.value.length + "7");
            session.send("Here are the top 3 stories on " + results.response)
            for (i = 0; i < 3; i++) {
                var msg = finaldata.value[i].name;
                var link = finaldata.value[i].url;
                session.send("<" + link + "|" + msg + ">")
            }
            //session.send("<"+link+"|"+msg+">")
        })
    }
])

var search = require('./search')(BingSearchApiKey)

dialog.on('searchNow', [
    function (session, args, next) {
        var searchObj = builder.EntityRecognizer.findEntity(args.entities, 'searchTopic')
        if (!searchObj) {
            builder.Prompts.text(session, 'I\'d love to search now but for what topic? (Rephase the sentence)')
        } else {
            console.log(searchObj.entity)
            next({response: searchObj.entity})
        }
    },
    function (session, results) {
        console.log(results.response + "2");
        searchnow = results.response
        console.log(searchnow);
        search.get(searchnow, function (error, data) {
            if (error) {
                console.error(error)
                session.beginDialog("uh oh, there was a problem conducting the search")
            }
            var finaldata = JSON.parse(data);
            console.log(finaldata + "6");
            session.send("Here are the top 3 searches on " + results.response)
            for (i = 0; i < 3; i++) {
                var msg = finaldata.webPages.value[i].name;
                var link = finaldata.webPages.value[i].url;
                console.log(msg + "6");
                session.send("<" + link + "|" + msg + ">")
            }
        })
    }
])

//dialog.on('none', [
//    function (session) {
//         session.send("Hi what do you want to know?")
//    }
//])

//dialog.onDefault(builder.DialogAction.send("Hi, what do you want to know? I can tell the weather, news and search for stuff."))

slackBot.listen(['ambient', 'direct_mention', 'mention', 'direct_message']);
//slackBot.listenForMentions();

bot.startRTM(function (err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    } else {
        console.log('Connected to slack');
    }
});