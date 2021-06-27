const mongoose = require('mongoose');

const CacheSchema = new mongoose.Schema({
	discordId: {
		type: String,
		required: true,
	},
	psid: {
		type: String,
		required: true,
	},
});

const Cache = mongoose.model('Cache', CacheSchema);
module.exports = Cache;