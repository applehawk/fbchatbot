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
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        url: process.env.MONGO_URI,
    });

    storage.delete(['name','age','favourite_color']);
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

controller.on('message', async(bot, message) => {
    // call the facebook API to get the bot's page identity
    let identity = await bot.api.callAPI('/me', 'GET', {});
    await bot.reply(message,`My name is ${ identity.name }`);
});

/*
let convo = new BotkitConversation('PROFILE_DIALOG', controller);

convo.addQuestion('What is your name?', async(response, convo, bot) => {
    console.log(`user name is ${ response }`);
},'name', 'default');

convo.addQuestion('What is your age?', async(response, convo, bot) => {
    console.log(`user age is ${ response }`);
},'age', 'default');

convo.addQuestion('What is your favorite color?', async(response, convo, bot) => {
    console.log(`user favourite color is ${ response }`);
},'color', 'default');

convo.after(async(results, bot) => {
    convo.say('You have {{vars.results.name}} {{vars.results.age}} and {{vars.results.color}}');
     // handle results.name, results.age, results.color
});
controller.addDialog(convo);
controller.on("facebook_postback", async(bot, message) => {
    try {
        await bot.beginDialog('PROFILE_DIALOG');
    } catch (error) {
        console.log('That did not go well.')
        throw error
    }
});

*/

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});


// Log every message received
/*
controller.middleware.receive.use(function(bot, message, next) {
    // log it
    console.log('RECEIVED: ', message);
    // modify the message
    message.logged = true;
    // continue processing the message
    next();
  });

*/