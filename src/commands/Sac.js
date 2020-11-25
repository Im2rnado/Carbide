const Auth = require('../libs/auth');
const axios = require('axios').default;
const Discord = require('discord.js');
const fs = require('fs');
const Endpoints = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'sac',
	description: 'Sets SAC Code',
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			const nopremembed = new Discord.MessageEmbed()
				.setColor('#FF0000')
				.setDescription('❌ This command only works in DMs');
			return message.channel.send(nopremembed).then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Changing V-Bucks Platform ...');

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

				if (!args.length) {

					const response1 = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token.access_token}`,
					} }).catch((err) => {
						console.error(err);
						const errormessage1 = new Discord.MessageEmbed()
							.setColor('#ffff00')
							.setTitle('⚠️ **Uh Oh! That was unexpected!**')
							.setDescription('There seems to be an error and we\'re working on a fix!')
							.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``)
							.setFooter(err.response.data.errorCode);

						h.edit('', errormessage1);
					});
					const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

					const embed = new Discord.MessageEmbed();
					embed.setColor(`${kcolor[1]}`);
					embed.setTitle('Support a Creator Code');
					embed.setAuthor(`${display1}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
					embed.setDescription(`Current Code: **${sac}**`);
					embed.setFooter('Use +sac <new code> to change it.');

					return h.edit('', { embed: embed });
				}
				else {
					const embed = new Discord.MessageEmbed().setColor(`${kcolor[1]}`);

					await axios.get(`https://payment-website-pci.ol.epicgames.com/affiliate/search-by-slug?slug=${args.join(' ')}`, { headers: {
						'Content-Type': 'application/json',
					} }).then((response) => {
						const code91 = response.data[0].slug;

						h.edit('Setting SAC ...');

						axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/SetAffiliateName?profileId=common_core&rvn=-1 `, {
							'affiliateName': `${code91}`,
						}, { headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token.access_token}`,
						} }).catch((err) => {
							console.error(err);
							message.channel.send(err);
						});
						embed.setTitle(`Support a Creator Code set to **${code91}**`);
						embed.setAuthor(`${display1}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
						return h.edit('', { embed: embed });
					}).catch((err) => {
						console.error(err);
						const errormessage1 = new Discord.MessageEmbed()
							.setColor('#ffff00')
							.setTitle(`⚠️ **${args.join(' ')}** is not a valid SAC`);

						return h.edit(' ', errormessage1);
					});

				}
			}
			else{
				const nopremembed = new Discord.MessageEmbed()
					.setColor('#FF0000')
					.setDescription('❌ You are not logged in.');
				return h.edit('', nopremembed);
			}
		}
		catch(err) {
			console.error(err);
			const errormessage1 = new Discord.MessageEmbed()
				.setColor('#ffff00')
				.setTitle('⚠️ **Uh Oh! That was unexpected!**')
				.setDescription('There seems to be an error and we\'re working on a fix!')
				.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

			h.edit(' ', errormessage1);
		}
	},
};
