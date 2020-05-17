//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the Welcome Bot bot.

// Import Botkit's core features
const { Botkit, BotkitConversation } = require('botkit');
const { FacebookAPI } = require('botbuilder-adapter-facebook');
// Import a platform-specific adapter for facebook.
const { FacebookAdapter, FacebookEventTypeMiddleware } = require('botbuilder-adapter-facebook');
const { ConversationState, UserState } = require('botbuilder');
const { BotkitCMSHelper } = require('botkit-plugin-cms');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

const util = require('util')

var detectDebug = function() {
    return process.env.NODE_ENV !== 'production';
};

// Load process.env values from .env file
require('dotenv').config();

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        url: process.env.MONGO_URI,
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
    storage: storage,
});

const GREETING_ID = 'GREETING_ID'
const ONBOARDING_ID = 'ONBOARDING_ID'
let greeting = new BotkitConversation(GREETING_ID, controller);
// send a greeting
greeting.addMessage('Version 1.0.1')
greeting.addMessage(`Hi! 👋

We are the (not)Random English an international online platform for training business English skills through a friendly networking format.

Every Monday and Thursday we will offer you for conversation an interesting person, selected following your interests among other participants.

We establish a simple system, first of all, you should share with us some information about yourself, your needs and your knowledge that might be useful for our community. It allows other people before the call to know what topics it will be interesting to discuss with you.

Let me ask you some questions and we will create your profile that will be available to other participants`);
greeting.ask({
    text: "Here we go?",
    quick_replies: [{
      content_type: 'text',
      title: 'Go!',
      payload: 'Go!',
    }],
  }, function(response, convo) {
    convo.stop();
  });

greeting.after(async(results, bot) => {
    bot.beginDialog(ONBOARDING_ID);
});

let onboarding = new BotkitConversation(ONBOARDING_ID, controller);
// ask a question, store the response in 'name'
onboarding.ask('What is your name?', async(response, convo, bot) => {
    console.log(`user name is ${ response }`);
    await controller.storage.write({"name": response});
}, 'name');
onboarding.say('Great! Your name is {{vars.name}}');
onboarding.ask(`Fine. Could you share with me a link to your Facebook profile?

    It needs for connection with partners. We will send the link to your partner for scheduling the call.
    
    Where you can find the link?
    
    For Facebook Messenger: go to your profile, this is where the chat list is, copy the profile link and send it to the dialogue.
    
    If you use a web browser:
    1) open in a new Facebook.com and go to your profile page
    2) copy the link from the address bar and send it to the dialogue.)`, 
    async(response, convo, bot) => {
        console.log(`user name is ${ response }`);
    }, 'facebook_url');

onboarding.ask(`It was not easy, but we did it! 😀

Now tell me where are you from?
(Country and city)`, async(response, convo, bot) => {
    console.log(`user name is ${ response }`);
    await controller.storage.write({"country_city": response});
}, 'country_city');

const professionAsk = `Next step:
What are you doing?

Tell us about your work, company, project or startup you are involved in.

For example, I'm a web designer in the Spanish game design studio or I am a marketer in the fintech project.`

onboarding.ask(professionAsk, async(response, convo, bot) => {
    console.log(`user profession is ${ response }`);
    await controller.storage.write({"profession": response});
}, 'profession');

onboarding.ask({
    text: 'Ok. What about English speaking? Choose your English level, it will help us to choose the suited person for the call.',
    quick_replies: [{
      content_type: 'text',
      title: 'Elementary',
      payload: 'Elementary',
    }, {
      content_type: 'text',
      title: 'Pre-Intermediate',
      payload: 'Pre-Intermediate',
    }, {
      content_type: 'text',
      title: 'Intermediate',
      payload: 'Intermediate',
    }, {
        content_type: 'text',
        title: 'Advanced',
        payload: 'Advanced',
    }],
  }, async(response, convo, bot) => {
    await controller.storage.write({"english_level": results.english_level});
    convo.stop();
  }, 'english_level');

onboarding.after(async(results, bot) => {
    bot.say(`Great `+results.name+`! We know about you next things:
    
What are you doing -> `+results.profession+`
What is your level of English -> `+results.english_level+`
You have a Facebook page :), here is it-> `+results.facebook_url+`
    
Oh yes, I completely forgot. You are from `+results.country_city);

    if (results._status === 'completed') {
        await controller.storage.write({"profession": results.profession});
        await controller.storage.write({"english_level": results.english_level});
        await controller.storage.write({"facebook_url": results.facebook_url});
        await controller.storage.write({"country_city": results.country_city});
        //storage.
        // any variable set with convo.setVar
        // and any response to convo.ask or convo.addQuestion
        // is present as results[keyname]

        // can do things like
        // await bot.beginDialog(NEXT_DIALOG);
    }

});

controller.addDialog(greeting);
controller.addDialog(onboarding);

controller.ready(() => {
    controller.on('facebook_postback', async (bot, message) => {
        if (message.postback.title == "Get Started") {
            await bot.beginDialog(GREETING_ID);
        };
    });
});

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});