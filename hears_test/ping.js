'use strict';

module.exports = (controller) => { // [OK]
  controller.hears(new RegExp(/^(ping)$/), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;

    console.log('[ping]:', message);
    await bot.say(`[${text}] pong 😉`);
  });
};
