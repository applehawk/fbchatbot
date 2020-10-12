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
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
// }

const adapter = new FacebookAdapter({
  access_token: FACEBOOK_ACCESS_TOKEN,
  api_version: 'v8.0',
  app_secret: FACEBOOK_APP_SECRET,
  debug: true, // [*]
  require_delivery: !isDev,
  verify_token: FACEBOOK_VERIFY_TOKEN,
});

/**
 * emit events based on the type of facebook event being received
 */
adapter.use(new FacebookEventTypeMiddleware());

const controller = new Botkit({
  adapter,
  storage,
  webhook_uri: '/api/messages',
});
// console.log(JSON.stringify(controller._config.scheduler_url)); // [OK][Tip] bot.getConfig('sheduler_uri')

const DIALOG_GREETING_ID = 'DIALOG_GREETING_ID';
const DIALOG_ONBOARDING_ID = 'DIALOG_ONBOARDING_ID';
const DIALOG_SCHEDULED_A_CALL_ID = 'DIALOG_SCHEDULED_A_CALL_ID';
const DIALOG_FACEBOOK_URL_ID = 'DIALOG_FACEBOOK_URL_ID';

const dialog_greeting = new BotkitConversation(DIALOG_GREETING_ID, controller);
const dialog_onboarding = new BotkitConversation(DIALOG_ONBOARDING_ID, controller);
const dialog_scheduled_a_call = new BotkitConversation(DIALOG_SCHEDULED_A_CALL_ID, controller);
const dialog_facebook_url = new BotkitConversation(DIALOG_FACEBOOK_URL_ID, controller);

controller.addDialog(dialog_greeting);
controller.addDialog(dialog_onboarding);
controller.addDialog(dialog_scheduled_a_call);
controller.addDialog(dialog_facebook_url);

/**
 * Backward compatibility
 */
const FB_DIALOG_ID = 'FB_DIALOG_ID';
const fb_dialog = new BotkitConversation(FB_DIALOG_ID, controller);
controller.addDialog(fb_dialog);

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

  if (id) {
    try {
      let appId = process.env.FACEBOOK_APPID;
      if (process.env.NODE_ENV === 'development') {
        const bot = await controller.spawn();
        const { id: botId } = await bot.api.callAPI('/me', 'GET');
        appId = botId;
      }

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
          bot: { id: appId },
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

      const messengerProfile = recipientProperties.facebook_url.split('/').splice(-1, 1);
      const url = `https://m.me/${messengerProfile}`;
      message.value = 'Click button user profile';
      await controller.trigger(['ANALYTICS_EVENT'], dialogBot, message);
      await res.redirect(url);
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

const { getUserContextProperties, resetUserContextProperties } = require(`./api/${process.env.API_VERSION}/helpers.js`);

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
    console.log('[ingest]:', !isDev ? message : '');

    controller.trigger(['mark_seen'], bot, message);

    if (message.type !== 'facebook_postback' && !bot.hasActiveDialog()) {
      // let senderProperties = await getUserContextProperties(controller, bot, message);
      // const target = senderProperties.conversation_with;

      // if (target) { // [OK]
      //   console.log(`[bot.js:223 DIALOG]: ${message.sender.id} > ${target}`);
      //   /**
      //    * #BEGIN Conversation with user
      //    */
      //   try {
      //     const dialogBot = await controller.spawn(message.sender.id);
      //     await dialogBot.startConversationWithUser(target);

      //     let recipientProperties = await getUserContextProperties(controller, dialogBot, message);

      //     if (Date.now() < senderProperties.expired_at) { // [OK]
      //       // /**
      //       //  * #BEGIN Bot typing
      //       //  */
      //       // /*await */controller.trigger(['sender_action_typing'], dialogBot, {
      //       //   options: { recipient: { id: target } },
      //       // });
      //       // // message.text += `\n\n[Session expired at: ${new Date(recipientProperties.expired_at).toLocaleString()}]`;

      //       // /**
      //       //  * Send message recipientProperties conversation
      //       //  */
      //       // await dialogBot.say({ // [OK]
      //       //   // textHighlights: 'text highlights',
      //       //   recipient: { id: target },
      //       //   sender: { id: message.sender.id },
      //       //   text: message.text,
      //       //   messaging_type: 'MESSAGE_TAG',
      //       //   tag: 'ACCOUNT_UPDATE',
      //       // });
      //     } else if (Date.now() > senderProperties.expired_at) {
      //       // await controller.trigger(['session_check'], bot, message);
      //     }

      //   } catch(error) {
      //     console.error('[bot.js:258 ERROR]:', error);
      //   }
      //   /**
      //    * #END Conversation with user
      //    */
      // }
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
    console.log('[send]:',/* !isDev ? */message/* : ''*/);

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
    'scheduling',
    'features'
  ];

  const version = process.env.API_VERSION;

  for (let i = 0; i < modules.length; i++) {
    controller.loadModules(`${__dirname}/api/${version}/${modules[i]}`, '.js');
    console.log(`[MODULES]: ${__dirname}/api/${version}/${modules[i]}`);
  }

  /**
   * load test feature modules
   */
  if (isDev) {
    controller.loadModules(`${__dirname}/api/${version}/handlers_test`, '.js');
    controller.loadModules(`${__dirname}/api/${version}/hears_test`, '.js');
  }

  // if (!isDev) {
    console.log(
      `\n[API]:\nversion: ${version}\n\n[EVENTS]:\n${Object.keys(controller._events).sort().join('\n')
      }\n\n[TRIGGERS]:\n${Object.keys(controller._triggers).sort().join('\n')
      }\n\n[INTERRUPTS]:\n${Object.keys(controller._interrupts).sort().join('\n')
      }\n[READY]\n`
    );
  // }

  // try {
  //   const ids = [
  //     '3049377188434960',
  //     // '3695161273833437',
  //     '4011572872217706'
  //   ];

  //   const broadcast = await controller.spawn();
  //   // await broadcast.startConversationWithUser();

  //   const options = {
  //     // sender: {
  //     //   id:'100832674981057'
  //     // },
  //     recipient: {
  //       ids: [...ids],
  //     },
  //     messaging_type: 'MESSAGE_TAG',
  //     tag: 'ACCOUNT_UPDATE',
  //     message: {
  //       text: 'This is a test broadcast message',
  //     },

  // //     recipient:{
  // //       id:'3049377188434960'
  // //     },
  // //      message: {
  // //       attachment: {
  // //         type: "template",
  // //         payload: {
  // //           template_type: "generic",
  // //           elements: [{
  // //             title: "Share demo",
  // //             subtitle: "Lorem ipsum....",
  // //             buttons: [{
  // //               type: "web_url",
  // //               title: "Watch video",
  // //               url: 'https://m.me/rndmenglish?ref=4011572872217706',
  // //             }],
  // //           }],
  // //         },
  // //       },
  // //     },
  // //     referral: {
  // //       ref: "share_link",
  // //       source: "SHORTLINK",
  // //       type: "OPEN_THREAD",
  // //     },
  //   };

  //   // const response = await broadcast.api.callAPI('/me/messages', 'POST', options);
  //   const personas = await broadcast.api.callAPI('/me/personas', 'GET', { limit: 1e4 });
  //   let list = Object.values(personas)[0];
  //   console.log(personas, list.length);

  //   if (list.length) {
  //     const task = async () => {
  //       const persona = list.shift();
  //       const result = await broadcast.api.callAPI(`/${persona.id}`, 'DELETE');
  //       console.log(persona, result, list.length);
  //       if (!list.length) {
  //         return;
  //       }
  //       setTimeout(async () => await task(), 1000);
  //     };

  //     await task();
  //   }
  // } catch (error) {
  //   console.log(error);
  // }



//     const options = { // [OK]
//       recipient: '3049377188434960',
//       messaging_type: 'MESSAGE_TAG',
//       tag: 'ACCOUNT_UPDATE',
//       messages: [
//         {
//           sender_action: 'typing_on',
//         },
//         {
//           message: {
//             attachment: {
//               type: 'template',
//               payload: {
//                 image_aspect_ratio: 'square', // <square | horizontal>
//                 template_type: 'generic',
//                 elements: [{ ...formatUserInfo(user, 0) }],
//               },
//             },
//           },
//         },
//         {
//           text: `
// 🗺 ${user.state.location}
// 💬 ${english_levelDict[user.state.english_level]}
// 👔 ${communityDict[user.state.community]}
// 🛠 ${user.state.profession}`,
//       }, {
//         text: 'Do not delay communication!\n\nText your partner on Facebook. Don\'t procrastinate, it will be better if you are scheduling the meeting immediately 🙂\n\nUse https://worldtimebuddy.com for matching the time for the call (your parnter might have another timezone)',
//       }],
//     };

//     try {
//       controller.trigger(['sender_action_typing'], bot, { options: { recipient: message.recipient } });
//       await bot.api.callAPI('/me/messages', 'POST', options);

});
