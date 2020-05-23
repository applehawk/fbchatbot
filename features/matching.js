const { MongoDbStorage } = require('botbuilder-storage-mongodb');
const { UserState } = require('botbuilder');
const { Activity } = require('botframework-schema');
const { uuid } = require('uuidv4');

const Constants = require('./../constants.js');

module.exports = function(controller) {
    const userState = new UserState(controller.storage);
    let storage = controller.storage;

    async function chooseWithLevel(storage, englishLevel, channelId, userId) {
        var allUsersQuery = { 
            _id: { 
                $regex: `${channelId}/users*`, 
                $ne: `${channelId}/users/${userId}/`,
            },
            $or: [{
                'state.english_level': {
                    $eq : englishLevel,
                }},
                {'state.english_level': {
                    $eq: (englishLevel+1)%(4),
                }},
                {'state.english_level': {
                    $eq: (englishLevel-1)%(4),
                }},
                {'state.english_level': {
                    $eq: (englishLevel+2)%4,
                }}
            ]
        };
        const docs = await storage.Collection.find(allUsersQuery);
        const storeItems = (await docs.toArray()).reduce((accum, item) => {
            accum[item._id] = item.state;
            return accum;
        }, {});
        return storeItems;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function getRandomDate() {
        // aprox nr of days since 1970 untill 2000: 30years * 365 days
        var nr_days1 = 52*365;
        // aprox nr of days since 1950 untill 1970: 20years * 365 days
        var nr_days2 = 51*365;
    
        // milliseconds in one day
        var one_day=1000*60*60*24
    
        // get a random number of days passed between 1950 and 2000
        var days = getRandomInt(nr_days2, nr_days1);
    
        return new Date(days*one_day)
    }

    controller.hears('rand', ['message','direct_message'], async(bot,message) => {
        try {
            const cities = ['Nizhnepavlovka','Ufa','Moscow','Khanty','Tyumen'];
            const professions = ['IT-Programmer', 'IT-Manager', 'Financist', 'Saler', 'Marketer', 'Translator','Politic'];
            const users = [];
            for (let i = 0; i <= 1; i++) {
                const userState = {
                    profession: professions[Math.round(Math.random() * professions.length - 1)],
                    enlish_level: Constants.englishLevelDict[
                        Math.round(Math.random() * Constants.englishLevelDict.length - 1)
                    ],
                    community: Constants.communityDict[
                        Math.round(Math.random() * Constants.communityDict.length - 1)
                    ],
                    username: `user${i}`,
                    country_city: cities[Math.round(Math.random() * cities.length - 1)],
                    eTag: '',
                };
    
                const randUserId = uuid();
                const newUser = { _id: `/facebook/users/${randUserId}/`, dt: new Date(Date.now() - Math.round(Math.random() * 1e9)), state: userState };
                users.push(newUser);
            }
    
            await storage.Collection.insertMany([...users]);
        } catch (error) {
            console.log(error);
        }
    });

    controller.hears('match', ['message','direct_message'], async (bot, message) => {
        console.log(message);
        let context = bot.getConfig('context');
        let storageKey = userState.getStorageKey(context);

        const activity = context.activity;
        const channelId = activity.channelId;
        const userId = activity && activity.from && activity.from.id ? activity.from.id : undefined;
        const englishLevelUser = await userState.createProperty('english_level').get(context);
        //let storageKey = `facebook/users/`;
        try {
            const storeItems = await chooseWithLevel(storage, englishLevelUser, channelId, userId);
            console.log(storeItems);
        } catch(error) {
            console.log(error);
        }
    });
}