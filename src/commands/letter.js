const { LETTER_FROM_ME_01, LETTER_FROM_ME_02} = require('../copy'); 

module.exports = {
	name: 'letter',
	description: 'my creator left a letter for you to read.',
	async execute(message) {
		await message.author.send(LETTER_FROM_ME_01);
		await message.author.send(LETTER_FROM_ME_02);
	},
};