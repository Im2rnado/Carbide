const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'vbucksplatform',
	description: 'Changes V-Bucks Platform ',
	aliases: ['platform', 'vp', 'plt', 'mtxplatform', 'vbplatform'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			const nopremembed = new MessageEmbed()
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

				const embed = new MessageEmbed().setColor(`${kcolor[1]}`);

				if(!args.length) {

					const response = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token.access_token}`,
					} }).catch((err) => {
						console.error(err);
						const errormessage1 = new MessageEmbed()
							.setColor('#ffff00')
							.setTitle('⚠️ **Uh Oh! That was unexpected!**')
							.setDescription('There seems to be an error and we\'re working on a fix!')
							.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``)
							.setFooter(err.response.data.errorCode);

						h.edit('', errormessage1);
					});

					const aff = response.data.profileChanges[0].profile.stats.attributes.current_mtx_platform;

					embed.setTitle('Current Platform');
					embed.setDescription(aff);

					return h.edit('', embed);
				}

				const platforms = ['WeGame', 'EpicPCKorea', 'Epic', 'EpicPC', 'EpicAndroid', 'PSN', 'EpicAndroid', 'Live', 'IOSAppStore', 'Nintendo', 'Samsung', 'Shared'];

				if (!(args[0] === 'WeGame' || args[0] === 'EpicPCKorea' || args[0] === 'Epic' || args[0] === 'EpicPC' || args[0] === 'EpicAndroid' || args[0] === 'PSN' || args[0] === 'EpicAndroid' || args[0] === 'Live' || args[0] === 'IOSAppStore' || args[0] === 'Nintendo' || args[0] === 'Samsung' || args[0] === 'Shared')) {
					embed.setTitle('❌ Wrong Usage');
					embed.setColor('FF0000');
					embed.addField('Please use one of these platforms:', platforms.join(' - '));

					return h.edit('', embed);
				}

				await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/SetMtxPlatform?profileId=common_core`, {
					'newPlatform': args.join(' '),
				}, { headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.access_token}`,
				} }).then((response) => {
					console.log(response.data);

					embed.setTitle(`Successfully changed V-Bucks Platform to **${args.join(' ')}**`);
					embed.setFooter('Use +balance to see your V-Bucks');
					h.edit('', { embed: embed });
				}).catch((err) => {
					console.error(err);
					const errormessage1 = new MessageEmbed()
						.setColor('#ffff00')
						.setTitle('⚠️ **Uh Oh! That was unexpected!**')
						.setDescription('There seems to be an error and we\'re working on a fix!')
						.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

					h.edit('', errormessage1);
				});
			}
			else{
				const nopremembed = new MessageEmbed()
					.setColor('#FF0000')
					.setDescription('❌ You are not logged in.');
				return h.edit('', nopremembed);
			}
		}
		catch(err) {
			console.error(err);
			const errormessage1 = new MessageEmbed()
				.setColor('#ffff00')
				.setTitle('⚠️ **Uh Oh! That was unexpected!**')
				.setDescription('There seems to be an error and we\'re working on a fix!')
				.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

			h.edit('', errormessage1);
		}
	},
};
