const { LETTER_FROM_ME_01, LETTER_FROM_ME_02, COULD_NOT_SEND_DM } = require('../copy');

module.exports = {
	name: 'letter',
	description: 'my creator left a letter for you to read.',
	async execute(message, client, args) {
		try {
			await message.author.send(LETTER_FROM_ME_01);
			await message.author.send(LETTER_FROM_ME_02);
		}
		catch (e) {
			await message.reply(COULD_NOT_SEND_DM);
		}
	},
};