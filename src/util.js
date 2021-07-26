module.exports = {
	fetchRoles: async (message) => {
			const memberRole = await module.exports.getRoleByMessage(message, "member");
			const officerRole = await module.exports.getRoleByMessage(message, "officer");
			return [memberRole, officerRole];
	},
	getRoleByMessage: async (message, roleName) => {
		try {
			return await message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);
		} catch (e) {
			return undefined;
		}
	},
	handledStatusCodes: [200, 404, 403],
};

