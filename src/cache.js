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

const Cache = mongoose.model('CacheMap', CacheSchema);

module.exports = Cache;