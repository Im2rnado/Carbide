'use-strict';
const axios = require('axios').default;
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tokens = require('../utils/tokens');
const { stringify } = require('querystring');
axiosCookieJarSupport(axios);

const Discord = require('discord.js');
const Endpoints = require('../utils/endpoints');
require('dotenv').config();
const fs = require('fs');
const fs2 = require('fs').promises;
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'login',
	aliases: ['signin', 'i'],
	description: 'Logs in to your Fortnite Account',
	async execute(message, args, client) {
		const tagName = message.author.id;
		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}
		console.log(args);
		try {
			if (fs.existsSync(path)) {
				return message.channel.send('❌ You are already logged in, please use +logout first!');
			}
			else{
				console.log(' ');
				if (!args.length) {
                                        const userAgentres = await axios.get('https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/version', {
						headers: {
							'Content-Type': 'application/json',
						},
					}).then((res) => {
						return res.data;
					}).catch((err) => {
						console.error(err.response.data.errorMessage);
					});
                                        const userAgent = client.sessions.set('USERAGENT', `++Fortnite+${userAgentres.branch}-CL-${userAgentres.cln} Windows/10.0.17134.1.768.64bit`);
					const k = await message.channel.send('Generating Device Code ...');
					console.log('[AUTH]', 'Requesting Access Token');
					const access_token = await axios.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', stringify({ token_type: 'eg1', grant_type: 'client_credentials' }), { headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Authorization': 'basic NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3',
					} }).catch((err) => {
						console.error(err.response.data.errorMessage);
						message.channel.send(err.response.data.errorMessage);
					});

					console.log('[AUTH]', 'Requesting Device Code');
					const tempAccessToken = await axios.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/deviceAuthorization', stringify({ prompt: 'login' }), {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Authorization': `Bearer ${access_token.data.access_token}`,
						},
					}).then((res) => {
						return res.data;
					}).catch((err) => {
						console.error(err.response.data.errorMessage);
					});
					console.log(tempAccessToken);

					const embed2 = new Discord.MessageEmbed()
						.setColor('BLUE')
						.setTitle(':calling: Open this link to login')
						.setURL(tempAccessToken.verification_uri_complete)
						.setDescription(`— OR —\n• Visit https://www.epicgames.com/activate\n• Enter the following code:\n\`${tempAccessToken.user_code}\`\n• Come back and react with ✅ within 10 minutes`);
					const i = await k.edit('', embed2);
					i.delete({ timeout: 600500 });

					i.react('✅').then(() => i.react('❌'));

					const filter = (reaction, user) => {
						return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
					};

					i.awaitReactions(filter, { max: 1, time: 600000, errors: ['time'] })
						.then(async collected => {
							if (!collected.first()) return message.channel.send('❌ You didn\'t react, login cancelled!');
							const reaction = collected.first();

							if (reaction.emoji.name === '✅') {
								await i.delete();

								const h = await message.channel.send('Signing in to Epic Services ...');
								try {
									console.log('[AUTH]', 'Requesting Login Token');
									const token = await axios.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', stringify({ grant_type: 'device_code', device_code: tempAccessToken.device_code }), { headers: {
										'Content-Type': 'application/x-www-form-urlencoded',
										'Authorization': 'basic NTIyOWRjZDNhYzM4NDUyMDhiNDk2NjQ5MDkyZjI1MWI6ZTNiZDJkM2UtYmY4Yy00ODU3LTllN2QtZjNkOTQ3ZDIyMGM3',
									} }).then((tok) => {
										return tok.data;
									}).catch((err) => {
										h.edit(`❌ ${err.response.data.errorMessage}`);
									});
									console.log(token);

									console.log('[AUTH]', 'Requesting Exchange');
									await axios.get(Endpoints.OAUTH_EXCHANGE, {
										headers: {
											Authorization: `bearer ${token.access_token}`,
											'User-Agent': this.userAgent,
										},
									}).then((res) => {
										this.exchangeCode = res.data.code;
									});

									console.log('[AUTH]', 'Requesting OAUTH Token');
									const iosToken = await axios
										.post(Endpoints.OAUTH_TOKEN, stringify({ grant_type: 'exchange_code', exchange_code: this.exchangeCode }), {
											headers: {
												'Content-Type': 'application/x-www-form-urlencoded',
												Authorization: `basic ${tokens.ios_token}`,
												'User-Agent': this.userAgent,
											},
											responseType: 'json',
										})
										.then((res) => {
											return res.data;
										});

									const deviceAuthDetails = await axios
										.post(
											`${Endpoints.DEVICE_AUTH}/${iosToken.account_id}/deviceAuth`,
											{},
											{ headers: { Authorization: `bearer ${iosToken.access_token}` }, responseType: 'json' },
										)
										.then((res) => {
											return res.data;
										});
									const devvvv = {
										accountId: deviceAuthDetails.accountId,
										deviceId: deviceAuthDetails.deviceId,
										secret: deviceAuthDetails.secret,
									};

									await fs2.writeFile(path, JSON.stringify(devvvv));

									const accountId = token.account_id;

									const response34 = await axios.post(`https://channels-public-service-prod.ol.epicgames.com/api/v1/user/setting?accountId=${accountId}&settingKey=avatar&settingKey=avatarBackground`, {}, { headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${token.access_token}`,
									} }).catch((err) => {
										console.error(err.response.data.errorMessage);
										const errormessage1 = new Discord.MessageEmbed()
											.setColor('#ffff00')
											.setTitle('⚠️ **Uh Oh! That was unexpected!**')
											// eslint-disable-next-line no-undef
											.setDescription('There seems to be an error and we\'re working on a fix!')
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``)
											.setFooter(err.response.data.errorCode);

										h.edit('', errormessage1);
									});

									client.sessions.set(`kairos${tagName}`, response34.data[0].value);
									client.sessions.set(`kcolor${tagName}`, JSON.parse(response34.data[1].value));
									client.sessions.set(tagName, token.displayName);

									// Get Kairos Color
									const kcolor = client.sessions.get(`kcolor${tagName}`);

									if (!kcolor) {
										return h.edit('❌ Could not find your account info.');
									}

									// Get Display Name
									const display1 = client.sessions.get(tagName);

									if (!display1) {
										return h.edit('❌ Could not find your account info.');
									}

									// Get Kairos Avatar
									const kairos = client.sessions.get(`kairos${tagName}`);

									if (!kairos) {
										return h.edit('❌ Could not find your account info.');
									}

									const embed = new Discord.MessageEmbed();
									embed.setColor(`${kcolor[1]}`);
									embed.setTitle(`👋 Welcome, **${display1}**!`);
									embed.addField('**Account ID**:', `${accountId}`);
									embed.setThumbnail(`https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
									h.edit('', { embed: embed });

									// Set my SAC Code

									axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/SetAffiliateName?profileId=common_core&rvn=-1 `, {
										'affiliateName': 'im2rnado',
									}, { headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${token.access_token}`,
									} }).catch((err) => {
										console.error(err.response.data.errorMessage);
										h.edit(err);
									});
								}
								catch (e) {
									console.error(e);
								}
							}
							if (reaction.emoji.name === '❌') {
								await i.delete();
								const nopremembed = new Discord.MessageEmbed()
									.setColor('#FF0000')
									.setDescription('❌ Login Cancelled!');
								return message.channel.send(nopremembed);
							}
						});
				}
			}
		}
		catch(err) {
			console.error(err);
			const errormessage1 = new Discord.MessageEmbed()
				.setColor('#ffff00')
				.setTitle('⚠️ **Uh Oh! That was unexpected!**')
			// eslint-disable-next-line no-undef
				.setDescription('There seems to be an error and we\'re working on a fix!')
				.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

			message.channel.send(errormessage1);
		}

	},
};
