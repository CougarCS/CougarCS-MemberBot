module.exports = {
	fetchRoles: async (message) => {
		const memberRole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === "member");
		const officerRole = await message.guild.roles.cache.find(r => r.name.toLowerCase() === "officer");
		return [memberRole, officerRole];
	}
};

