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

/*process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason)
    process.exit(1)
  });*/

/**
 * Load process.env values from .env file
 */
require('dotenv').config(
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === undefined ?
    { path: `${__dirname}/.dev.env` } : {}
);

const isDev = process.env.NODE_ENV !== 'production';
console.log('[DEBUG]:', isDev);

const {
    MONGO_URI,
    DATABASE_COLLECTION,
    DATABASE_NAME,
    FACEBOOK_VERIFY_TOKEN,
    FACEBOOK_ACCESS_TOKEN,
    FACEBOOK_APP_SECRET,
} = process.env;

let storage = null;

// if (!isDev) {
    storage = new MongoDbStorage({
        collection: DATABASE_COLLECTION,
        database: DATABASE_NAME,
        url: MONGO_URI,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
// }

const adapter = new FacebookAdapter({
    access_token: FACEBOOK_ACCESS_TOKEN,
    receive_via_postback: true,
    debug: true,
    api_version: 'v7.0',
    app_secret: FACEBOOK_APP_SECRET,
    debug: true, // [*]
    receive_via_postback: true, // [*]
    require_delivery: !isDev,
    verify_token: FACEBOOK_VERIFY_TOKEN,
});

/**
 * emit events based on the type of facebook event being received
 */
adapter.use(new FacebookEventTypeMiddleware());

const controller = new Botkit({
    // scheduler_uri: '/api/scheduler',
    adapter,
    storage,
    webhook_uri: '/api/messages',
});

// console.log(JSON.stringify(controller._config.scheduler_url)); // [OK][Tip] bot.getConfig('sheduler_uri')

// if (!isDev) {
    const GREETING_ID = 'GREETING_ID';
    const ONBOARDING_ID = 'ONBOARDING_ID';

    const greeting = new BotkitConversation(GREETING_ID, controller);
    const onboarding = new BotkitConversation(ONBOARDING_ID, controller);

    controller.addDialog(greeting);
    controller.addDialog(onboarding);
// }

/**
 * #BEGIN Configure routers
 */
controller.webserver.get('/', async (req, res) => {
    await res.send(`This app is running Botkit ${ controller.version }.`);
});

// // make content of the local public folder available at http://MYBOTURL/path/to/folder
// controller.publicFolder('/api/sheduler', `${__dirname}/api/sheduler`);

// controller.webserver.get('/api/sheduler', async (req, res) => {
//     await res.send(`This is Sheduler Page.`);
// });
/**
 * #END Configure routers
 */

/**
 * #BEGIN Configure middlewares
 *
 * @ingest occurs immediately after the message has been received, before any other processing
 * @receive occurs after the message has been evaluated for interruptions and for inclusion in an ongoing dialog. signals the receipt of a message that needs to be handled.
 * @send occurs just before a message is sent out of the bot to the messaging platform
 *
 * @url https://botkit.ai/docs/v4/core.html#botkit-middleware
 */
const middlewares = {
    // spawn: async (bot, message, next) => {
    //     console.log('[spawn]:', message);
    //     // call next, or else the message will be intercepted
    //     next();
    // },
    ingest: async (bot, message, next) => {
        console.log('[ingest]:', message);
        // call next, or else the message will be intercepted
        next();
    },
    send: async (bot, message, next) => {
        console.log('[send]:', message);
        // call next, or else the message will be intercepted
        next();
    },
    receive: async (bot, message, next) => {
        console.log('[receive]:', message);
        // call next, or else the message will be intercepted
        next();
    },
    // interpret: async (bot, message, next) => {
    //     console.log('[interpret]:', message);
    //     // call next, or else the message will be intercepted
    //     next();
    // },
};

Object.keys(middlewares).forEach(func => {
    controller.middleware[func].use(middlewares[func]);
});
/**
 * #END Configure middlewares
 */

controller.ready(async () => {
    /**
     * load traditional developer-created local custom feature modules
     */
    const modules = [
        'handlers',
        'hears',

        /**
         * @Tip Features folder must be loaded finally after all behind
         */
        'features'
    ];

    for (let i = 0; i < modules.length; i++) {
        controller.loadModules(`${__dirname}/${modules[i]}`);
    }

    /**
     * load test feature modules
     */
    if (isDev) {
        await controller.loadModules(__dirname + '/handlers_test');
        await controller.loadModules(__dirname + '/hears_test');
    }

    console.log('ready');
});


