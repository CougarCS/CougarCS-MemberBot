require('dotenv').config();
const mongoose = require("mongoose");
const Cache = require("./cache");

const connector = mongoose.connect(
    process.env.MONGO_URI, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Mongoose is connected.")
);

module.exports = {
    cacheExists: async (givenDiscordId) => Cache.exists({ discordId : { $eq: givenDiscordId }}),
    createCache: async (givenDiscordId, givenPsid) => new Cache({ discordId: givenDiscordId, psid: givenPsid }).save(),
    getCacheData: async () => Cache.find({}),
    deleteCache: async (givenPsid) => Cache.deleteOne({ psid: { $eq: givenPsid }}),
}