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
const { UserState } = require('botbuilder');

const { USER_DIALOG_SESSION_EXPIRED } = require('./constants.js');

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
    collection: DATABASE_COLLECTION,
    database: DATABASE_NAME,
    url: MONGO_URI,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
// }

const adapter = new FacebookAdapter({
  access_token: FACEBOOK_ACCESS_TOKEN,
  api_version: 'v7.0',
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

/**
 * #BEGIN Conversation Helpers
 */
const getUserContextProperties = async (bot, message) => { // [OK]
  let userState = new UserState(controller.storage);
  let context = bot.getConfig('context');

  let communityProperty = await userState.createProperty('community');
  let conversationWithProperty = await userState.createProperty('conversation_with');
  let englishLevelProperty = await userState.createProperty('english_level');
  let expiredAtProperty = await userState.createProperty('expired_at');
  let facebookURLProperty = await userState.createProperty('facebook_url');
  let locationProperty = await userState.createProperty('location');
  let professionProperty = await userState.createProperty('profession');
  let readyToConversationProperty = await userState.createProperty('ready_to_conversation');
  let recentUsersProperty = await userState.createProperty('recent_users');

  let community = await communityProperty.get(context);
  let conversationWith = await conversationWithProperty.get(context);
  let englishLevel = await englishLevelProperty.get(context);
  let expiredAt = await expiredAtProperty.get(context);
  let facebookURL = await facebookURLProperty.get(context);
  let location = await locationProperty.get(context);
  let profession = await professionProperty.get(context);
  let readyToConversation = await readyToConversationProperty.get(context);
  let recentUsers = await recentUsersProperty.get(context, []);

  return {
    context,
    userState,

    communityProperty,
    conversationWithProperty,
    englishLevelProperty,
    expiredAtProperty,
    facebookURLProperty,
    locationProperty,
    professionProperty,
    readyToConversationProperty,
    recentUsersProperty,

    community,
    conversationWith,
    englishLevel,
    expiredAt,
    facebookURL,
    location,
    profession,
    readyToConversation,
    recentUsers,
  };
};

/**
 * @TODO Rewrite to Cron Job
 */
const sessionTimerStart = async () => {
  console.log('sessionTimerStart()');
// /**
//  * @TODO Rewrite to async version with timers queue
//  */
//   clearTimeout(sessionTimerId);
//   if (readyToConversation === 'busy' && expiredAt > Date.now()) {
//     console.log('session started');

//     /**
//      * Clear matching timer
//      */
//     clearTimeout(message.value);

//     sessionTimerId = setTimeout(async () => { // [OK][?]
//       /**
//        * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
//        * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
//        */
//       await bot.changeContext(message.reference);

//       clearTimeout(sessionTimerId);

//       // [TODO] #BEGIN Refactoring
//       /**
//        * #BEGIN Bot typing
//        */
//       await controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.sender } });
//       await bot.say(USER_DIALOG_SESSION_EXPIRED);

//       /**
//        * Reset conversation status
//        */
//       await resetUsersConvoWithProperties(bot, message);
//     }, end);
//   } else {
//     console.log('session cleared');
//     clearTimeout(sessionTimerId);
//     await resetUsersConvoWithProperties(bot, message);
//   }
  return true;
};

const resetUsersConvoWithProperties = async (bot, message) => { // [OK]
  const {
    context,
    userState,

    conversationWithProperty,
    expiredAtProperty,
    readyToConversationProperty,

    conversationWith,
  } = await getUserContextProperties(bot, message);

  await controller.trigger(['delete_menu'], bot, message.sender);

  await conversationWithProperty.set(context, 0);
  await expiredAtProperty.set(context, 0);
  await readyToConversationProperty.set(context, 'ready');

  /**
   * Save userState changes to storage
   */
  const result = await userState.saveChanges(context);
  console.log('session cleared');

  /**
   * #BEGIN Bot typing
   */
  await controller.trigger(['sender_action_typing'], bot, { // [OK]
    options: { recipient: message.sender },
  });

  await bot.say({ // [OK]
    recipient: message.sender,
    text: USER_DIALOG_SESSION_EXPIRED,
  });

  await bot.cancelAllDialogs();
  message.value = undefined;

  // await controller.trigger(['start_match'], bot, message);

  return result;
};

/**
 * #END Conversation Helpers
 */

const middlewares = {
  spawn: async (bot, next) => {
    console.log('[spawn]:'/*, bot*/);

    // call next, or else the message will be intercepted
    next();
  },

  ingest: async (bot, message, next) => {
    // await resetUsersConvoWithProperties(bot, message);
    console.log('[ingest]:'/*, message*/);

    await controller.trigger(['mark_seen'], bot, message);

    if (message.type !== 'facebook_postback' && !bot.hasActiveDialog()) {
      let senderProperties = await getUserContextProperties(bot, message);
      const target = senderProperties.conversationWith;

      if (target) { // [OK]
        console.log(`[bot.js:289 DIALOG]: ${message.sender.id} > ${target}`);
        /**
         * #BEGIN Conversation with user
         */
        try {
          const dialogBot = await controller.spawn(message.sender.id);
          await dialogBot.startConversationWithUser(target);

          let recipientProperties = await getUserContextProperties(dialogBot, message);

          // // #BEGIN Sync session expiration time
          // const sessionExpiredAt = senderProperties.expiredAt < recipientProperties.expiredAt ? !recipientProperties.expiredAt ? recipientProperties.expiredAt : (Date.now() + (1000 * 60 * 60 * 24 * 2)) : senderProperties.expiredAt;

          // await senderProperties.expiredAtProperty.set(senderProperties.context, sessionExpiredAt);
          // await senderProperties.userState.saveChanges(senderProperties.context);

          // await recipientProperties.expiredAtProperty.set(recipientProperties.context, sessionExpiredAt);
          // await recipientProperties.userState.saveChanges(recipientProperties.context);
          // // #END Sync session expiration time

          // // Update properties info
          // senderProperties = await getUserContextProperties(bot, message);
          // recipientProperties = await getUserContextProperties(dialogBot, message);

          /**
           * @TODO Start session timer
           */
          // if (senderProperties.conversationWith === undefined) {
          //   sessionTimerStart();
          // }

          if (Date.now() < senderProperties.expiredAt) { // [OK]
            // /**
            //  * #BEGIN Bot typing
            //  */
            // await controller.trigger(['sender_action_typing'], dialogBot, {
            //   options: { recipient: { id: target } },
            // });
            // // message.text += `\n\n[Session expired at: ${new Date(recipientProperties.expiredAt).toLocaleString()}]`;

            // /**
            //  * Send message recipientProperties conversation
            //  */
            // await dialogBot.say({ // [OK]
            //   // textHighlights: 'text highlights',
            //   recipient: { id: target },
            //   sender: { id: message.sender.id },
            //   text: message.text,
            // });
          } else if (Date.now() > senderProperties.expiredAt) {
            // // v1 [OK]
            // await resetUsersConvoWithProperties(dialogBot, message);
            // await resetUsersConvoWithProperties(bot, message);

            // v2 [*]
            // await controller.trigger(['session_check'], dialogBot, message);
            // await controller.trigger(['session_check'], bot, message);
          }

        } catch(error) {
          console.error('[bot.js:354 ERROR]:', error);
        }
        /**
         * #END Conversation with user
         */
      }
    } else {
      if (!!message.postback) {
        if (message.postback.payload.match('reset')) {
          const { conversationWith } = await getUserContextProperties(bot, message);

          await resetUsersConvoWithProperties(bot, message);

          const dialogBot = await controller.spawn(message.sender.id);

          const messageRef = {
            ...message,
            sender: { id: conversationWith },
            user: conversationWith,
            channel: conversationWith,
            value: undefined,
            reference: {
              ...message.reference,
              activityId: undefined,
              user: { id: conversationWith, name: conversationWith },
              conversation: { id: conversationWith },
            },
            incoming_message: {
              ...message.incoming_message,
              conversation: { id: conversationWith },
              from: { id: conversationWith, name: conversationWith },
              recipient: message.recipient,
              channelData: {
                ...message.incoming_message.channelData,
                sender: { id: conversationWith },
              },
            },
          };

          await dialogBot.startConversationWithUser(conversationWith);
          await resetUsersConvoWithProperties(dialogBot, messageRef);
        }
      }
    }

    // call next, or else the message will be intercepted
    next();
  },

  send: async (bot, message, next) => { // [OK]
    console.log('[send]:'/*, message*/);

    // call next, or else the message will be intercepted
    next();
  },

  receive: async (bot, message, next) => {
    console.log('[receive]:'/*, message*/);

    // call next, or else the message will be intercepted
    next();
  },

  interpret: async (bot, message, next) => {
    console.log('[interpret]:'/*, message*/);

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
    await controller.loadModules(__dirname + '/handlers_test', '.js');
    await controller.loadModules(__dirname + '/hears_test', '.js');
  }

  console.log(
    `\n[EVENTS]:\n${
        Object.keys(controller._events).sort().join('\n')
    }\n\n[TRIGGERS]:\n${
        Object.keys(controller._triggers).sort().join('\n')
    }\n\n[INTERRUPTS]:\n${
        Object.keys(controller._interrupts).sort().join('\n')
    }\n[READY]\n`
  );
});

