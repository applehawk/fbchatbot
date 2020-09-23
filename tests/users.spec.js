'use strict';

const { test } = require('ava');

const { addUsers } = require('./utils.js');

const storage = require('./fixtures/storage.js');

test.before(() => {
  storage.users = addUsers(10);
  console.log(storage.users.map((item) => item.state));
  storage.users[0];//?
});

test.todo('Can add user into storage');
test.todo('Can read user`s info');
test.todo('Can write user`s info');
test.todo('Can update user`s info');
test.todo('Can set user`s properties');
