const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
	discordId: {
		type: String,
		required: true,
		unique: true,
	},
	psid: {
		type: String,
		required: true,
		unique: true,
	},
});

const Cache = mongoose.model('Cache', CacheSchema);
module.exports = Cache;