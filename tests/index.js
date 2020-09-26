'use strict';

let users = [];

for (let i = 0; i < 100; i++) {
  users.push({ id: `${i}${Math.round(Math.random() * 1e2)}` });
}

let usersList = Object.values(users);
let deleted = [];

console.log('before:', usersList.length, deleted.length);

let delay = 1000;
const doit = async (user, i) => {
  console.log('task', i);
  const task = setTimeout(() => {
    const localUser = usersList.find(({ id }) => id === user.id);
    const localUserIndex = usersList.indexOf(localUser);
    if (localUserIndex > -1) {
      deleted.push(usersList.splice(localUserIndex, 1));
      console.log(usersList.length, deleted.length);
      let index = Math.round((Math.random() * usersList.length) - 1) + 0;
      while (index < 0) {
        index = Math.round((Math.random() * usersList.length) - 1) + 0;
      }
      const deletedUser = usersList[index];
      const deletedUserIndex = usersList.indexOf(deletedUser);

      deleted.push(usersList.splice(deletedUserIndex, 1));
      console.log(usersList.length, deleted.length);

      console.log(user, '\t', localUser, '\t', localUserIndex, '\t', deletedUser, '\t', index, deletedUserIndex, i, usersList.length);

      if (!usersList.length) {
        console.log('after:', usersList.length, deleted.length/* , usersList, deleted */);
      }
    } else {
      delay = delay - 1000;
      return doit(users[i + 1], i + 1);
    }
  }, delay);

  return {
    *[Symbol.iterator]() {
      // yield doit(user, i);
      yield task;
    }
  };
};

// usersList.forEach((user, i) => {
//   // delay = i * 100;
//   // setTimeout(() => { return { ...doit(user, i) } }, delay);
//   // Array.from({...doit(user, i)});
// });

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
