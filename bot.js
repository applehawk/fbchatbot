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
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(
    process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === undefined ?
      { path: `${__dirname}/.dev.env` } : {}
  );
}

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
    debug: true,
    collection: DATABASE_COLLECTION,
    database: DATABASE_NAME,
    url: MONGO_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
// }

const adapter = new FacebookAdapter({
  access_token: FACEBOOK_ACCESS_TOKEN,
  api_version: 'v8.0',
  app_secret: FACEBOOK_APP_SECRET,
  debug: true, // [*]
  // receive_via_postback: true, // [*]
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
  const SCHEDULED_A_CALL_ID = 'SCHEDULED_A_CALL_ID';

  const greeting = new BotkitConversation(GREETING_ID, controller);
  const onboarding = new BotkitConversation(ONBOARDING_ID, controller);
  const scheduled_a_call = new BotkitConversation(SCHEDULED_A_CALL_ID, controller);

  controller.addDialog(greeting);
  controller.addDialog(onboarding);
  controller.addDialog(scheduled_a_call);
// }

/**
 * #BEGIN Configure routers
 */
controller.webserver.get('/', async (req, res) => {
  await res.send(`This app is running Botkit ${ controller.version }.`);
});

controller.webserver.get('/api/profile', async (req, res) => {
  const query = req['_parsedUrl'].query;
  const queryMatch = query.match(/(\d+)/);
  const id = !!queryMatch ? queryMatch[0] : false;
  console.log(req['_parsedUrl'].path, query, id);
  if (id) {
    try {
      const message = {
        channel: id,
        message: { text: '' },
        messaging_type: 'MESSAGE_TAG',
        recipient: { id },
        sender: { id },
        tag: 'ACCOUNT_UPDATE',
        text: '',
        timestamp: Date.now(),
        type: 'facebook_postback',
        user: id,
        value: undefined,
        reference: {
          activityId: undefined,
          bot: { id: process.env.FACEBOOK_APPID },
          conversation: { id },
          user: { id, name: id },
        },
        incoming_message: {
          channelId: 'facebook',
          conversation: { id },
          from: { id, name: id },
          recipient: { id, name: id },
          channelData: {
            messaging_type: 'MESSAGE_TAG',
            tag: 'ACCOUNT_UPDATE',
            sender: { id },
          },
        },
      };

      const dialogBot = await controller.spawn(id);
      await dialogBot.startConversationWithUser(id);

      const recipientProperties = await getUserContextProperties(controller, dialogBot, message);

      message.value = 'Click button user profile';
      await controller.trigger(['ANALYTICS_EVENT'], dialogBot, message);
      await res.redirect(recipientProperties.facebook_url);
    } catch (error) {
      console.error(error);
    }
  } else {
    await res.sendStatus(404);
  }
});

// // make content of the local public folder available at http://MYBOTURL/path/to/folder
// controller.publicFolder('/date', __dirname + '/date');

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

/**
 * #BEGIN Conversation Helpers
 */

const { getUserContextProperties, resetUserContextProperties } = require('./helpers.js');

/**
 * #END Conversation Helpers
 */

const middlewares = {
  spawn: async (bot, next) => {
    // console.log('[spawn]:'/*, bot*/);

    // call next, or else the message will be intercepted
    next();
  },

  ingest: async (bot, message, next) => {
    message = {
      ...message,
      messaging_type: 'MESSAGE_TAG',
      tag: 'ACCOUNT_UPDATE',
    };
    // await resetUserContextProperties(controller, bot, message);
    console.log('[ingest]:'/* , message */);

    controller.trigger(['mark_seen'], bot, message);

    if (message.type !== 'facebook_postback' && !bot.hasActiveDialog()) {
      let senderProperties = await getUserContextProperties(controller, bot, message);
      const target = senderProperties.conversation_with;

      if (target) { // [OK]
        console.log(`[bot.js:154 DIALOG]: ${message.sender.id} > ${target}`);
        /**
         * #BEGIN Conversation with user
         */
        try {
          const dialogBot = await controller.spawn(message.sender.id);
          await dialogBot.startConversationWithUser(target);

          let recipientProperties = await getUserContextProperties(controller, dialogBot, message);

          if (Date.now() < senderProperties.expired_at) { // [OK]
            // /**
            //  * #BEGIN Bot typing
            //  */
            // /*await */controller.trigger(['sender_action_typing'], dialogBot, {
            //   options: { recipient: { id: target } },
            // });
            // // message.text += `\n\n[Session expired at: ${new Date(recipientProperties.expired_at).toLocaleString()}]`;

            // /**
            //  * Send message recipientProperties conversation
            //  */
            // await dialogBot.say({ // [OK]
            //   // textHighlights: 'text highlights',
            //   recipient: { id: target },
            //   sender: { id: message.sender.id },
            //   text: message.text,
            //   messaging_type: 'MESSAGE_TAG',
            //   tag: 'ACCOUNT_UPDATE',
            // });
          } else if (Date.now() > senderProperties.expired_at) {
            // await controller.trigger(['session_check'], bot, message);
          }

        } catch(error) {
          console.error('[bot.js:189 ERROR]:', error);
        }
        /**
         * #END Conversation with user
         */
      }
    } else {
      if (!!message.postback) {
        if (message.postback.payload.match('reset')) {
          // const { conversation_with } = await getUserContextProperties(controller, bot, message);

          await resetUserContextProperties(controller, bot, message);

          /**
           * @TIP Moved into helpers.js
           */
          // const messageRef = {
          //   ...message,
          //   channel: conversation_with,
          //   sender: { id: conversation_with },
          //   user: conversation_with,
          //   value: undefined,
          //   reference: {
          //     ...message.reference,
          //     activityId: undefined,
          //     user: { id: conversation_with, name: conversation_with },
          //     conversation: { id: conversation_with },
          //   },
          //   incoming_message: {
          //     ...message.incoming_message,
          //     conversation: { id: conversation_with },
          //     from: { id: conversation_with, name: conversation_with },
          //     recipient: message.recipient,
          //     channelData: {
          //       ...message.incoming_message.channelData,
          //       sender: { id: conversation_with },
          //     },
          //   },
          // };

          // const dialogBot = await controller.spawn(message.sender.id);
          // await dialogBot.startConversationWithUser(conversation_with);

          // await resetUserContextProperties(controller, dialogBot, messageRef);
        }
      }
    }

    // call next, or else the message will be intercepted
    next();
  },

  send: async (bot, message, next) => { // [OK]
    message = {
      ...message,
      messaging_type: 'MESSAGE_TAG',
      tag: 'ACCOUNT_UPDATE',
    };
    console.log('[send]:', message);

    // call next, or else the message will be intercepted
    next();
  },

  receive: async (bot, message, next) => {
    console.log('[receive]:'/* , message */);
    // call next, or else the message will be intercepted
    next();
  },

  interpret: async (bot, message, next) => {
    console.log('[interpret]:'/* , message */);
    // call next, or else the message will be intercepted
    next();
  },
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
   * @Tip Features folder must be loaded finally after all behind
   */
  const modules = [
    'handlers',
    'features'
  ];

  for (let i = 0; i < modules.length; i++) {
    controller.loadModules(`${__dirname}/${modules[i]}`, '.js');
    console.log(`[MODULES]: ${__dirname}/${modules[i]}`);
  }

  /**
   * load test feature modules
   */
  if (isDev) {
    controller.loadModules(__dirname + '/handlers_test', '.js');
    controller.loadModules(__dirname + '/hears_test', '.js');
  }

  if (!isDev) {
    console.log(
      `\n[EVENTS]:\n${Object.keys(controller._events).sort().join('\n')
      }\n\n[TRIGGERS]:\n${Object.keys(controller._triggers).sort().join('\n')
      }\n\n[INTERRUPTS]:\n${Object.keys(controller._interrupts).sort().join('\n')
      }\n[READY]\n`
    );
  }
});
