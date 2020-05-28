'use strict';

// #BEGIN DEV
const {
  englishLevelDict,
  communityDict,
} = require(`../constants.js`);
// #END DEV

module.exports = (controller) => { // [OK]
  controller.hears(new RegExp(/^(rand( +?\d+)?)$/, 'i'), ['message', 'direct_message'], async (bot, message) => {
    const { text } = message;
    let total = text.replace(/([^\d])+/g, '');
    total = total !== '' && total.length && total > 0 ? total : 1;

    const locations = ['Nizhnepavlovka', 'Ufa', 'Moscow', 'Khanty', 'Tyumen', 'Russian', 'Russia', 'Singapour', 'Australian', 'Turkey'];
    const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator', 'Politic', 'Developer', 'Web Designer', 'Web Developer', 'Junior Frontend Developer', 'Middle Frontend Developer', 'Backend Developer'];
    const names = ['Nunc', 'Risus', 'Enim', 'Laoreet in', 'Suscipit', 'Eu Facilisis', 'A Nibh'];
    const users = [];
    for (let i = 0; i < total; i++) {
      const user = {
        _id: `facebook/users/${Math.round(Math.random() * 1e15).toString(10)}/`,
        dt: new Date(Date.now() - Math.round(Math.random() * 1e10)),
        state: {
          community: Math.round(Math.random() * (communityDict.length - 1)),
          location: locations[Math.round(Math.random() * (locations.length - 1))],
          english_level: Math.round(Math.random() * (englishLevelDict.length - 1)),
          profession: professions[Math.round(Math.random() * (professions.length - 1))],
          ready_to_conversation: 'ready',
          username: `${names[Math.round(Math.random() * (names.length - 1))]} ${names[Math.round(Math.random() * (names.length - 1))]}`,
        },
      };

      users.push(user);
    }
    try {
      const storage = controller.storage;
      const result = await storage.Collection.insertMany([...users]);
      console.log(message, JSON.stringify(result, null, 2));
      await bot.say(`[${text}] Inserted Count: ${result.insertedCount}`);
    } catch (error) {
      console.log(error);
    }
  });
};
