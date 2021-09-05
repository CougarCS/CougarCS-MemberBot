const { digitsRegex, allDigitsRegex } = require('./regex');
const { prefixes } = require('./config.json');

module.exports = {
	fetchRoles: async (message) => {
		const memberRole = await module.exports.getRoleByMessage(message, 'member');
		const officerRole = await module.exports.getRoleByMessage(message, 'officer');
		return [memberRole, officerRole];
	},
	getRoleByMessage: async (message, roleName) => {
		try {
			return await message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
		}
		catch (e) {
			return undefined;
		}
	},
	handledStatusCodes: [200, 404, 403],
	async getUserFromMention(client, mention) {
		if (!mention) return;
		const userId = module.exports.getUserIdFromMention(mention);
		console.log('User ID: ' + userId);
		return await client.users.cache.get(userId);
	},
	getUserIdFromMention(mention) {
		console.log('Mention: ' + mention);
		if (allDigitsRegex.test(mention)) return mention;
		return mention.match(digitsRegex)[0];
	},
	millisToSeconds(millis) {
		return (millis / 1000).toFixed(1);
	},
	detectPrefix(message) {
		for (const str of prefixes) if (message.startsWith(str)) return str;
	},
};

