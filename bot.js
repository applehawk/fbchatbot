'use strict';

//  __   __  ___        ___
// |__) /  \  |  |__/ |  |
// |__) \__/  |  |  \ |  |

// This is the main file for the Welcome Bot bot.

// Import Botkit's core features
const { Botkit, BotkitConversation } = require('botkit');
// Import a platform-specific adapter for facebook.
const { FacebookAdapter, FacebookEventTypeMiddleware } = require('botbuilder-adapter-facebook');
const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// const util = require('util');

/*process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason)
    process.exit(1)
  });*/

const detectDebug = () => process.env.NODE_ENV !== 'production';

console.log('[DEBUG]:', detectDebug());

// Load process.env values from .env file
require('dotenv').config( detectDebug() ? { path: `${__dirname}/.dev.env` } : {});

let storage = null;
if (process.env.MONGO_URI) {
    //storage = require('botkit-storage-mongo')({mongoUri: "https:\\"+process.env.MONGO_URI})
    storage = new MongoDbStorage({
        useNewUrlParser: true,
        useUnifiedTopology: true,
        url: process.env.MONGO_URI,
        collection: process.env.DATABASE_COLLECTION,
        database: process.env.DATABASE_NAME,
    });
}

const adapter = new FacebookAdapter({
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    access_token: process.env.FACEBOOK_ACCESS_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    api_version: 'v7.0',
    require_delivery: !detectDebug(),
});

// emit events based on the type of facebook event being received
adapter.use(new FacebookEventTypeMiddleware());

const controller = new Botkit({
    webhook_uri: '/api/messages',
    adapter,
    storage,
});

const GREETING_ID = 'GREETING_ID';
const ONBOARDING_ID = 'ONBOARDING_ID';

const greeting = new BotkitConversation(GREETING_ID, controller);
const onboarding = new BotkitConversation(ONBOARDING_ID, controller);

controller.addDialog(greeting);
controller.addDialog(onboarding);

// [!] DEV ONLY
if (detectDebug()) {
    controller.on('message', async(bot, message) => {
        await bot.cancelAllDialogs();
        console.log('[message]:', message);
    });
}

controller.on('facebook_postback', async (bot, message) => {
    if (message.postback.title === 'Get Started') {
        try {
            const context = bot.getConfig('context');
            const activity = context._activity;

            const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;

            // Get user's FB Profile Info
            const url = `/${userId}`;
            const response = await bot.api.callAPI(url, 'GET');

            const username = `${response.first_name !== '' ? response.first_name : ''}${response.last_name !== '' ? ' ' + response.last_name : ''}`;
            const profilePic = response.profile_pic;

            const options = {
                recipient: {
                    id: userId,
                },
                message: {
                    attachment: {
                        type: "image",
                        payload: {
                            url: "https://media.giphy.com/media/kaHP7Ci7xVFzN8JJbk/giphy.gif",
                            is_reusable: true,
                        }
                    }
                }
            };
            await bot.api.callAPI('/me/messages', 'POST', options);

            await bot.beginDialog(GREETING_ID, { username, profilePic });
        } catch(error) {
            console.error(error);
        }
    }
});

controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');
    controller.loadModules(__dirname + '/hears');

    // load test feature modules
    // controller.loadModules(__dirname + '/features_test');
    controller.loadModules(__dirname + '/hears_test');

    console.log('ready');
});

controller.webserver.get('/', async (req, res) => {
    await res.send(`This app is running Botkit ${ controller.version }.`);
});
