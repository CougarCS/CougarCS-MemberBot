const config = require('../config.json');
const prefix = config.prefixes[0];

module.exports = {
	name: 'help',
	description: 'info on all of my commands.',
	useAllowedChannels: true,
	usage: '<command?>',
	example: ['', 'claim'],
	async execute(message, client, args) {
		const data = [];
		const { commands } = message.client;

		if (!args.length) {
			data.push('Here\'s a list of all my commands:\n```');
			data.push(commands.map(command => command.name).join(', '));
			data.push(`\`\`\`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

			return await message.reply(data, { split: true });
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name);

		if (!command) {
			await message.reply('*I don\'t know that command!*');
			return;
		}

		data.push(`**Command Name:** ${command.name}`);
		if (command.description) data.push(`**Description:** ${command.description}`);
		data.push(`**Usage:** \`${prefix}${command.name} ${command.usage ? command.usage : ''}\``);

		if (command.example === undefined || typeof command.example === 'string') {
			data.push(`**Example:** \`${prefix}${command.name} ${command.example ? command.example : ''}\``);
		}
		else if (command.example && Array.isArray(command.example)) {
			for (let i = 0; i < command.example.length; i++) {
				data.push(`**Example ${i + 1}:** \`${prefix}${command.name} ${command.example[i]}\``);
			}
		}

		await message.channel.send(data, { split: true });
		return;
	},
};