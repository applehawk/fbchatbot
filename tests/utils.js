'use strict';

const {
  english_levelDict,
  communityDict,
} = require(`../constants.js`);

module.exports.addUsers = (total = 1, options = {}) => { // [OK]
  const locations = ['Nizhnepavlovka', 'Ufa', 'Moscow', 'Khanty', 'Tyumen', 'Russian', 'Russia', 'Singapour', 'Australian', 'Turkey'];
  const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator', 'Politic', 'Developer', 'Web Designer', 'Web Developer', 'Junior Frontend Developer', 'Middle Frontend Developer', 'Backend Developer'];
  const names = ['Nunc', 'Risus', 'Enim', 'Laoreet in', 'Suscipit', 'Eu Facilisis', 'A Nibh', 'Ibh Facil', 'Pit', 'Laor', 'Su', 'En', 'Lisi', 'du`Fa'];
  const users = [];
  for (let i = 0; i < total; i++) {
    const user = {
      _id: `facebook/users/${Math.round(Math.random() * 1e15).toString(10)}/`,
      dt: new Date(Date.now() - Math.round(Math.random() * 1e10)),
      state: {
        community: Math.round(Math.random() * (communityDict.length - 1)),
        english_level: Math.round(Math.random() * (english_levelDict.length - 1)),
        facebook_url: `https://facebook.com/${Math.round(Math.random() * 1e10).toString(16)}`,
        location: locations[Math.round(Math.random() * (locations.length - 1))],
        profession: professions[Math.round(Math.random() * (professions.length - 1))],
        profile_pic: `https://picsum.photos/300/200/?random=${Math.round(Math.random() * 1e3)}`,
        ready_to_conversation: 'ready',
        username: `${names[Math.round(Math.random() * (names.length - 1))]} ${names[Math.round(Math.random() * (names.length - 1))]}`,
      },
      ...options,
    };

    users.push(user);
  }
  return [ ...users ];
};
