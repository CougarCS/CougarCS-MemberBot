const fetch = require('node-fetch');
const { requestRetryLimit } = require('./config.json');
const createLogger = require('./logger');
const logger = createLogger(__filename);

const baseUrl = process.env.MEMBER_API_BASE_URL;
const accessKey = process.env.MEMBER_API_ACCESS_KEY;
const secretKey = process.env.MEMBER_API_SECRET_KEY;

module.exports = {
	token: undefined,
	getToken: async () => {
		const url = `${baseUrl}/login`;
		const responseObj = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				accessKeyID: accessKey,
				secretAccessKey: secretKey,
			}),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
		});

		if (responseObj.status != 200) {
			const json = await responseObj.json();
			logger.info(JSON.stringify(json, null, 2));
			return undefined;
		}

		const json = await responseObj.json();
		module.exports.token = json.token;
		logger.debug(module.exports.token);
	},

	getStatus: async (psid, retry = 0) => {
		if (retry >= requestRetryLimit) {return undefined;}

		const url = `${baseUrl}/contact/status?psid=${psid}`;
		const responseObj = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });

		if (responseObj.status === 403) {
			await module.exports.getToken();
			return await module.exports.getStatus(psid, retry + 1);
		}

		return responseObj;
	},

	getStatusOnly: async (psid, retry = 0) => {
		if (retry >= requestRetryLimit) {return undefined;}

		const url = `${baseUrl}/contact/status?psid=${psid}`;
		const responseObj = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });

		if (responseObj.status === 401 || responseObj.status === 403) {
			await module.exports.getToken();
			return await module.exports.getStatusOnly(psid, retry + 1);
		}

		const json = await responseObj.json();
		return json['member-status'];
	},

	getEmail: async (psid, retry = 0) => {
		if (retry >= requestRetryLimit) {return undefined;}
		const url = `${baseUrl}/contact?psid=${psid}`;

		const responseObj = await fetch(url, {
			method: 'GET',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${module.exports.token}`,
				'Accept': 'application/json',
			},
		});

		logger.info('getEmail status: ' + responseObj.status);
		const headers = await responseObj.headers;
		logger.info('getEmail response headers: ' + JSON.stringify(headers, null, 4));
		const json = await responseObj.json();
		logger.info('getEmail response body: ' + JSON.stringify(json, null, 4));

		if (responseObj.status === 401 || responseObj.status === 403) {
			await module.exports.getToken();
			return await module.exports.getEmail(psid, retry + 1);
		}

		return await json['Email'];
	},


	getContactInfoByPsid: async (psid, retry = 0) => {
		if (retry >= requestRetryLimit) {
			return undefined;
		}

		const url = `${baseUrl}/contact?psid=${psid}`;

		const responseObj = await fetch(url, {
			method: 'GET',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${module.exports.token}`,
				'Accept': 'application/json',
			},
		});

		logger.info('getContactInfoByPsid responseObj.status = ' + responseObj.status);
		const headers = await responseObj.headers;
		logger.info('getContactInfoByPsid response headers: ' + JSON.stringify(headers, null, 4));
		const json = await responseObj.json();
		logger.info('getContactInfoByPsid response body: ' + JSON.stringify(json, null, 4));

		if (responseObj.status === 403 || responseObj.status == 401) {
			await module.exports.getToken();
			return await module.exports.getContactInfoByPsid(psid, retry + 1);
		}

		return await json;
	},

	getContactInfoByEmail: async (email, retry = 0) => {
		if (retry >= requestRetryLimit) {
			return undefined;
		}

		const url = `${baseUrl}/contact?email=${email}`;

		const responseObj = await fetch(url, {
			method: 'GET',
			withCredentials: true,
			credentials: 'include',
			headers: {
				'Authorization': `Bearer ${module.exports.token}`,
				'Accept': 'application/json',
			},
		});

		logger.info('getContactInfoByEmail status: ' + responseObj.status);
		const headers = await responseObj.headers;
		logger.info('getContactInfoByEmail response headers: ' + JSON.stringify(headers, null, 4));
		const json = await responseObj.json();
		logger.info('getContactInfoByEmail response body: ' + JSON.stringify(json, null, 4));

		if (responseObj.status === 403 || responseObj.status == 401) {
			await module.exports.getToken();
			return await module.exports.getContactInfoByEmail(email, retry + 1);
		}

		return await json;
	},
};