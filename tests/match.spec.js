'use strict';

// const { addUsers } = require('./utils.js');

// // import storage from './fixtures/storage';
// const storage = require('./fixtures/storage.js');

// storage.users = addUsers(1e2);

// let usersList = Object.values(storage.users);

const users = [];

for (let i = 0; i < 1e2; i++) {
  users.push({ id: i, data: `${i}${Math.random() * 1}` });
}

let usersList = Object.values(users);
let deleted = [];

const start = Date.now();

const task = async () => {
  usersList.shift();
  let index = Math.round((Math.random() * usersList.length) - 1) + 0;
  while (index < 0) {
    index = Math.round((Math.random() * usersList.length) - 1) + 0;
  }

  deleted.push(usersList.splice(index, 1));

  if (!usersList.length) {
    const finish = parseFloat((Date.now() - start) / 1e3).toFixed(3);
    console.log('finish:', finish, 'sec');
    return;
  }
  const t = setTimeout(() => {
    task();
  }, Math.round(Math.random() * 1e3));
};

if (usersList.length) {
  task();
}

// const arr = [
//   { id: 123 },
//   {
//     id: 456,
//     item: {
//       key1: 'value1',
//       key2: { obj1: 'text' },
//     },
//   },
//   { arr: ['element1', 'element2', 'element3'] },
// ];

// const find = (obj, query = {}) => {
//   return obj.find(value => JSON.stringify(value) === JSON.stringify(query));
// };
