require('dotenv').config();
const mongoose = require('mongoose');
const Cache = require('./cache');

mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => console.log('Mongoose is connected.'),
);

module.exports = {
	cacheExists: async (givenDiscordId) => Cache.exists({ discordId : { $eq: givenDiscordId } }),
	cacheExistsByPsid: async (givenPsid) => Cache.exists({ psid : { $eq: givenPsid } }),
	createCache: async (givenDiscordId, givenPsid) => new Cache({ discordId: givenDiscordId, psid: givenPsid }).save(),
	getCacheData: async () => Cache.find({}),
	getOneCacheByPsid: async (givenPsid) => Cache.findOne({ psid: { $eq: givenPsid } }),
	deleteCache: async (givenPsid) => Cache.deleteOne({ psid: { $eq: givenPsid } }),
	deleteCacheByDiscordId: async (givenDiscordId) => Cache.deleteOne({ discordId: { $eq: givenDiscordId } }),
};