const _ = require('lodash');
module.exports = {
	pretty: function(title, data) {
		return `${title}\n\`\`\`json\n${_.truncate(JSON.stringify(data, null, 4), { length: 1500, omission: '...' })}\n\`\`\``;
	},
};

