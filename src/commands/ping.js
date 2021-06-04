module.exports = {
	name: 'ping',
	description: 'Ping!',
	async execute(message, args, roleId) {
		const guild = message.guild;

		await message.reply('Pong.');
		return;
	},
};