var Botkit = require('botkit');
var builder = require('botbuilder');

var openWeatherApiKey = "997684052093606682f0251a37e1d126";
var controller = Botkit.slackbot();
var bot = controller.spawn({
   token: "xoxb-41185367776-EBhJdJnL1rcMJiTlEyamFGOa"
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

dialog.on('weather', [
    function (session, args, next){
        var countryObj = builder.EntityRecognizer.findEntity(args.entities, 'country')
        country = countryObj.entity
        if(!country){
            builder.Prompts.text(session, 'I\'d love to give you the weather but for where?')
        }else{
            next({response: country })
        }
    },
    function (session, results){
        country = results.response
        //console.log(country);
        weather.get(country, function(error, msg){
                    if(error){
                        console.error(error)
                        session.send("uh oh, there was a problem getting the weather")
                    }
                    session.send(msg)
                })
    }
])

dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I only tell the weather."))

slackBot.listenForMentions();

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }else{
      console.log('Connected to slack');
  }
});