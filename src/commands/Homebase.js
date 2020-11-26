const Auth = require('../libs/auth');
const axios = require('axios').default;
const Discord = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';

module.exports = {
	name: 'homebase',
	description: 'Changes your STW Homebase Name',
	aliases: ['homebasename'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Changing homebase name ...');

		try {
			if (fs.existsSync(path)) {

				if (!args[0] || args[0] === '') {
					const embed = new Discord.MessageEmbed();
					embed.setColor('BLUE');
					embed.setTitle('Use +homebase <new name> to change your Homebase name');
					return h.edit('', { embed: embed });
				}
				else {

					const auth = new Auth();

					const token = await auth.login(null, '');
					const { accountId } = require('../libs/deviceAuthDetails.json');

					// Get Kairos Color
					let kcolor = client.sessions.get(`kcolor${tagName}`);

					if (!kcolor) {
						const response34 = await axios.post(`https://channels-public-service-prod.ol.epicgames.com/api/v1/user/setting?accountId=${accountId}&settingKey=avatar&settingKey=avatarBackground`, {}, { headers: {
							'Content-Type': 'application/json',
                                                        'User-Agent': USER_AGENT,
							'Authorization': `Bearer ${token.access_token}`,
						} }).catch((err) => {
							console.error(err);
						});

						client.sessions.set(`kairos${tagName}`, response34.data[0].value);
						client.sessions.set(`kcolor${tagName}`, JSON.parse(response34.data[1].value));
						client.sessions.set(tagName, token.displayName);
					}

					kcolor = client.sessions.get(`kcolor${tagName}`);

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

					const embed = new Discord.MessageEmbed().setColor(`${kcolor[1]}`);

					await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/SetHomebaseName?profileId=common_public&rvn=-1`, {
						'homebaseName': `${args.join(' ')}`,
					}, { headers: {
						'Content-Type': 'application/json',
                                                'User-Agent': USER_AGENT,
						'Authorization': `Bearer ${token.access_token}`,
					} }).then((response) => {
						console.log(response);

						embed.setTitle(`✅ Successfully set homebase name to **${args.join(' ')}**`);
						h.edit('', { embed: embed });
					}).catch((err) => {
						console.error(err);
						h.edit('❌ You do not own STW!');
					});
				}
			}
			else{
				h.edit('❌ You are not logged in.');
			}
		}
		catch(err) {
			console.error(err);
			h.edit('❌ You do not own STW!');
		}

	},
};
