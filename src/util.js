const _ = require('lodash');
module.exports = {
	pretty: function(title, data) {
		return `${title}\n\`\`\`json\n${_.truncate(JSON.stringify(data, null, 4), { length: 1500, omission: '...' })}\n\`\`\``;
	},

	fetchRoles: message => {
		const memberRole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === "member");
		const officerRole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === "officer");
		return [memberRole, officerRole];
	}
};

