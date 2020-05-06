//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the Welcome Bot bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
// Import a platform-specific adapter for facebook.
const { FacebookAdapter, FacebookEventTypeMiddleware } = require('botbuilder-adapter-facebook');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}

const adapter = new FacebookAdapter({
    // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    enable_incomplete: true,
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    access_token: process.env.FACEBOOK_ACCESS_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
})

// emit events based on the type of facebook event being received
adapter.use(new FacebookEventTypeMiddleware());

const controller = new Botkit({
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});

const MY_DIALOG_ID = 'DIALOG1';
let convo = new BotkitConversation(MY_DIALOG_ID, controller);

controller.ready(() => {
    // send a greeting
    convo.say('Howdy!');
    // ask a question, store the response in 'name'
    convo.ask('What is your name?', async(response, convo, bot) => {
        console.log(`user name is ${ response }`);
        // do something?
    }, 'name');

    controller.hears('hello','direct_message', function(bot, message) {
        bot.reply(message,'Hello yourself!');
    });
});

controller.addDialog(convo);
/* 
let { Botkit } = require('botkit');

const controller = new Botkit(MY_CONFIGURATION);

controller.hears('hello','direct_message', function(bot, message) {
    bot.reply(message,'Hello yourself!');
});
*/
/*
controller.ready(() => {
	controller.on('message', async(bot, message) => {
    		await bot.reply(message, message.text);
	});
});*/

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});





