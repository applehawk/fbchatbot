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

const isDev = process.env.NODE_ENV !== 'production';

console.log('[DEBUG]:', isDev);

// Load process.env values from .env file
require('dotenv').config( isDev ? { path: `${__dirname}/.dev.env` } : {});

const {
    MONGO_URI,
    DATABASE_COLLECTION,
    DATABASE_NAME,
    FACEBOOK_VERIFY_TOKEN,
    FACEBOOK_ACCESS_TOKEN,
    FACEBOOK_APP_SECRET,
} = process.env;

const storage = new MongoDbStorage({
    collection: DATABASE_COLLECTION,
    database: DATABASE_NAME,
    url: MONGO_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const adapter = new FacebookAdapter({
    access_token: FACEBOOK_ACCESS_TOKEN,
    api_version: 'v7.0',
    app_secret: FACEBOOK_APP_SECRET,
    require_delivery: true,//!isDev,
    verify_token: FACEBOOK_VERIFY_TOKEN,
});

// emit events based on the type of facebook event being received
adapter.use(new FacebookEventTypeMiddleware());

const controller = new Botkit({
    webhook_uri: '/api/messages',
    // scheduler_url: '/scheduler',
    adapter,
    storage,
});

// console.log(JSON.stringify(controller._config.scheduler_url)); // [OK]

const GREETING_ID = 'GREETING_ID';
const ONBOARDING_ID = 'ONBOARDING_ID';

const greeting = new BotkitConversation(GREETING_ID, controller);
const onboarding = new BotkitConversation(ONBOARDING_ID, controller);

controller.addDialog(greeting);
controller.addDialog(onboarding);

// [!] DEV ONLY
if (isDev) {
    controller.on('message', async(bot, message) => {
        console.log('[message]:', message);
    });
}

controller.ready(() => {
    // load traditional developer-created local custom feature modules
    const modules = [
        'features',
        'hears'
    ];

    for (let i = 0; i < modules.length; i++) {
        controller.loadModules(`${__dirname}/${modules[i]}`);
    }

    // load test feature modules
    if (isDev) {
        controller.loadModules(__dirname + '/handlers_test');
        controller.loadModules(__dirname + '/hears_test');
    }

    console.log('ready');
});

controller.webserver.get('/', async (req, res) => {
    await res.send(`This app is running Botkit ${ controller.version }.`);
});

// controller.webserver.get('/scheduler', async (req, res) => { // [OK][*]
//     await res.send(`This is scheduler_url.`);
// });
