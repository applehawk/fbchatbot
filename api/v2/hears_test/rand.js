'use strict';

const {
  english_levelDict,
  communityDict,
} = require('../constants.js');

module.exports = async (controller) => { // [OK]
  // return;
  controller.hears(new RegExp(/^(rand)( +)?(\d+)?$/i), ['message', 'direct_message'], async (bot, message) => {
    try {
      const total = message.matches[3] || 1;

      const locations = ['Nizhnepavlovka', 'Ufa', 'Moscow', 'Khanty', 'Tyumen', 'Russian', 'Russia', 'Singapour', 'Australian', 'Turkey'];
      const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator', 'Politic', 'Developer', 'Web Designer', 'Web Developer', 'Junior Frontend Developer', 'Middle Frontend Developer', 'Backend Developer'];
      const names = ['Nunc', 'Risus', 'Enim', 'Laoreet in', 'Suscipit', 'Eu Facilisis', 'A Nibh', 'Ibh Facil', 'Pit', 'Laor', 'Su', 'En', 'Lisi', 'du`Fa'];
      const users = [];

      const task = async (count) => {
        if (count > 0) {
          const profile_pic = `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`;
          const username = `${names[Math.round(Math.random() * (names.length - 1))]} ${names[Math.round(Math.random() * (names.length - 1))]}`;

          const options = {
            recipient: message.recipient,
            name: username,
            profile_picture_url: profile_pic,
          };

          const persona = await bot.api.callAPI('/me/personas', 'POST', options);

          const user = {
            _id: `facebook/users/${persona.id}/`,
            dt: new Date(Date.now() - Math.round(Math.random() * 1e10)),
            state: {
              community: Math.round(Math.random() * (communityDict.length - 1)),
              english_level: Math.round(Math.random() * (english_levelDict.length - 1)),
              facebook_url: `https://facebook.com/${persona.id}`,
              location: locations[Math.round(Math.random() * (locations.length - 1))],
              persona,
              profession: professions[Math.round(Math.random() * (professions.length - 1))],
              profile_pic,
              ready_to_conversation: 'ready',
              skip: Math.random() > 0.62,
              username,
            },
          };

          users.push(user);
          count -= 1;
          console.log(JSON.stringify(user, null, 2), total - count, '/', total);

          await task(count);
        } else {
          return;
        }
      };

      await task(total);

      const result = await controller.storage.Collection.insertMany([...users]);

      let ids = [];
      Object.values(result.insertedIds).forEach((item, i) => {
        ids.push(result.insertedIds[i]);
      });

      await bot.say(`[rand.js:68] Inserted Count: ${result.insertedCount}\n\n_ids:\n\n${ids.join('\n')}`);
    } catch(error) {
      console.error('[rand.js:70 ERROR]:', error);
    }
  });
};
