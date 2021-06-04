module.exports = {
	name: 'flush',
	superuser: true,
	description: 'remove expired roles.',
	async execute(message, args, role) {
		// Check if user already has role, if so, exit.
		// Check if user already in cache, if so, grant role and exit.
		// Otherwise, send DM for PSID and exit.
	},
};