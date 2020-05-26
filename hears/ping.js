'use strict';

module.exports = (controller) => { // [OK]
  controller.hears('ping', ['message', 'direct_message'], async (bot, message) => {
    console.log('[ping]:', message);
    bot.say('pong 😉');
  });
};
