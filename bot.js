//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the Welcome Bot bot.

// Import Botkit's core features
const { Botkit, BotkitConversation } = require('botkit');
const { FacebookAPI } = require('botbuilder-adapter-facebook');
// Import a platform-specific adapter for facebook.
const { FacebookAdapter, FacebookEventTypeMiddleware } = require('botbuilder-adapter-facebook');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

const util = require('util')

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        useUnifiedTopology: true,
        url : process.env.MONGO_URI,
    });
}

const adapter = new FacebookAdapter({
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

const DIALOG_ONBOARDING = 'DIALOG1';
let conversation = new BotkitConversation(DIALOG_ONBOARDING, controller);
conversation.say('Hello! Welcome to my app.');
conversation.say('Let us get started...');
// pass in a message with an action that will cause gotoThread to be called...
conversation.addAction('continuation');
conversation.addMessage('This is a different thread completely', 'continuation2');
controller.addDialog(conversation);


controller.on('facebook_postback', async(bot, message) => {
    await bot.beginDialog(DIALOG_ONBOARDING);
});

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});



