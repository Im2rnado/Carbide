/* eslint-disable no-undef */
const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'balance',
	description: 'Returns Vbucks Balance (Premium Only)',
	aliases: ['bal', 'vbucks'],
	async execute(message, args, client) {
		// DMs only

		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Getting Vbucks ...');

		try {
			if (fs.existsSync(path)) {

				const auth = new Auth();

				const token = await auth.login(null, '');
				console.log(token);
				const { accountId } = require('../libs/deviceAuthDetails.json');

					// Get Kairos Color
					let kcolor = client.sessions.get(`kcolor${tagName}`);

					if (!kcolor) {
						const response34 = await axios.post(`https://channels-public-service-prod.ol.epicgames.com/api/v1/user/setting?accountId=${accountId}&settingKey=avatar&settingKey=avatarBackground`, {}, { headers: {
							'Content-Type': 'application/json',
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

				const embed = new MessageEmbed().setColor(`${kcolor[1]}`);

				const response = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				} }).catch((err) => {
					console.error(err);
					h.edit('❌ An Error Has Occured');
				});
				const mtxQantitys = { currency: 0 };
				const breakdown = [];
				const keys = Object.keys(response.data.profileChanges[0].profile.items);

				for (let i = 0; i < keys.length; i++) {
					const item = response.data.profileChanges[0].profile.items[keys[i]];

					if(item.templateId.includes('Currency')) {
						mtxQantitys.fullCurrency = mtxQantitys.currency += item.quantity;

						breakdown.push(`**${Number(item.quantity).toLocaleString()}** x **${item.attributes.platform || 'Shared'} ${item.templateId.split(':')[1].replace('Mtx', '')}**`);
					}
				}

				embed.setTitle(`${mtxQantitys.fullCurrency} Vbucks`);
				embed.setAuthor(`${display1}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
				embed.addField('Breakdown:', breakdown);

				return h.edit('', embed);
			}
			else{
				h.edit('❌ You are not logged in.');
			}
		}
		catch (err) {
			console.error(err);
			const errormessage1 = new MessageEmbed()
				.setColor('#ffff00')
				.setTitle('⚠️ **Uh Oh! That was unexpected!**')
				.setDescription(`There seems to be an error and we're working on a fix!`)
				.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

			h.edit('', errormessage1);
		}
	},
};
