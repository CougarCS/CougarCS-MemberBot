module.exports = {
	name: 'ping',
	description: 'Ping!',
	async execute(message, client, args) {
		const guild = message.guild;

		await message.reply('Pong.');
		return;
	},
};