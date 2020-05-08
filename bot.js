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


const DIALOG_ONBOARDING = "TestDialog1"
let convo = new BotkitConversation(DIALOG_ONBOARDING, controller);
// send a greeting
convo.say('Hi! 👋\
\
We are the (not)Random English an international online platform for training business English skills through a friendly networking format.\
\
Every Monday and Thursday we will offer you for conversation an interesting person, selected following your interests among other participants.\
\
We establish a simple system, first of all, you should share with us some information about yourself, your needs and your knowledge that might be useful for our community. It allows other people before the call to know what topics it will be interesting to discuss with you.\
\
Let me ask you some questions and we will create your profile that will be available to other participants'
);

convo.ask({
    attachment: {
        'type': 'template',
        'payload': {
            'template_type': 'button',
            'text': 'Here we go?',
            'buttons': [
                {
                    'type': 'postback',
                    'title': 'Go!',
                    'payload': 'Go!',
                },
            ]  
        }
    }
}, [async(response_text, convo, bot, full_message) => {
    await convo.say('Let\' go');
    //convo.say('Awesome. Here '+response.text);
    }]
);

// use add action to switch to a different thread, defined below...
//convo.addAction('username_ask');
// ask a question, store the response in 'name'
convo.ask('What is your name?', async(res, convo, bot) => {}, {key: 'name'});
// ask a question, store the response in 'name'
convo.ask('What is your Facebook URL?', async(res, convo, bot) => {}, {key: 'facebook_url'});

//convo.say('Hello {{vars.name}}, you have facebookPage {{vars.facebook_url}}')

/*

// define a profile collection dialog
let convo = new BotkitConversation('PROFILE_DIALOG', controller);
convo.ask('What is your name?', [], 'name');
convo.ask('What is your age?', [], 'age');
convo.ask('What is your favorite color?', [], 'color');
convo.after(async(results, bot) => {
    await convo.say('You have {{results.name}} {{results.age}} and {{results.color}}');
     // handle results.name, results.age, results.color
});
controller.addDialog(convo);
*/

controller.on("event,facebook_postback", async(bot, message) => {
    //console.log("Check it Bro!");
    //console.log(util.inspect(message));
    await bot.beginDialog(DIALOG_ONBOARDING);
});

/*
const DIALOG_ONBOARDING = 'DIALOG1';
let conversation = new BotkitConversation(DIALOG_ONBOARDING, controller);
conversation.say('Hello! Welcome to my app.');
conversation.say('Let us get started...');
// pass in a message with an action that will cause gotoThread to be called...
conversation.addAction('continuation');
conversation.addMessage('This is a different thread completely', 'continuation2');
controller.addDialog(conversation);*/


//controller.on('facebook_postback', async(bot, message) => {
//    await bot.beginDialog(DIALOG_ONBOARDING);
//});

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});



