

module.exports = {
	name: 'test',
	description: 'use to test out code.',
	async execute(message, client) {
		const guild = client.guilds.cache.find(g => g.id === "abc");
		console.log(guild)
	},
};