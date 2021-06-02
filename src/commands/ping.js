module.exports = {
	name: 'ping',
	description: 'Ping!',
	async execute(message, args) {
		await message.reply('Pong.');
        return;
	},
};