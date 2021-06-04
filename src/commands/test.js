module.exports = {
	name: 'test',
	description: 'use to test out code.',
	async execute(message, args, role) {
		await message.member.roles.add(role);
		await message.reply(roleId);
	},
};