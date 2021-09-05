require('dotenv').config();
const mongoose = require('mongoose');
const Cache = require('./cache');
const { getUserIdFromMention } = require('./util');

mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => console.log('Mongoose is connected.'),
);

module.exports = {
	cacheExists: async (givenDiscordId) => Cache.exists({ discordId : { $eq: givenDiscordId } }),
	cacheExistsByPsid: async (givenPsid) => Cache.exists({ psid : { $eq: givenPsid } }),
	createCache: async (discordUser, givenPsid) => new Cache({ discordId: getUserIdFromMention(discordUser.id), psid: givenPsid }).save(),
	getCacheData: async () => Cache.find({}),
	getOneCacheByPsid: async (givenPsid) => Cache.findOne({ psid: { $eq: givenPsid } }),
	deleteCache: async (givenPsid) => Cache.deleteMany({ psid: { $eq: givenPsid } }),
	deleteCacheByDiscordId: async (givenDiscordId) => Cache.deleteMany({ discordId: { $eq: givenDiscordId } }),
};