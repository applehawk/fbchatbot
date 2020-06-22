'use strict';

module.exports = async (controller) => {
  let delay = 10000;
  let timersQueue = [];

  const setTimer = async (bot, message) => { // [OK]
    clearTimeout(timersQueue[message.user]);
    timersQueue[message.user] = null;
    /**
     * Running a timer if the user doesn't have an active dialog and message.value is empty
     */
    if (!bot.hasActiveDialog() && message.value === undefined) {
      const reference = message.reference;
      clearTimeout(message.value);
      message.value = setTimeout(async () => { // [OK]
        /**
         * @TIP https://github.com/howdyai/botkit/issues/1724#issuecomment-511557897
         * @TIP https://github.com/howdyai/botkit/issues/1856#issuecomment-553302024
         */
        await bot.changeContext(reference);

        await controller.trigger(['match'], bot, message);
        setTimeout(async () => { // [OK]
          await bot.changeContext(reference);
          clearTimeout(message.value);
          if (Object.keys(timersQueue).includes(message.user)) {
            delay += 10000;
          } else {
            delay = 10000;
            await setTimer(bot, message);
          }
        }, 5000);
      }, delay);
      timersQueue[message.user] = message.value;
    }
  };

  controller.on(['start_match'], async (bot, message) => {
    if (!bot.hasActiveDialog() && message.value === undefined) {
      await setTimer(bot, message);
    }
  });
};
