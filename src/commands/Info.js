const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const moment = require('moment');
const Endpoints = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'info',
	description: 'Returns account info (Premium Only)',
	aliases: ['account'],
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

		const h = await message.channel.send('Getting account info <a:loading:754479771089371318>');

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

				const embed = new MessageEmbed().setColor(`${kcolor[1]}`).setFooter('Use Code: im2rnado', message.author.displayAvatarURL({ dynamic: true }));

				const response = await axios.get(`${Endpoints.DEVICE_AUTH}/${accountId}`, { headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.access_token}`,
				} }).catch((err) => {
					console.error(err);
					const errormessage1 = new MessageEmbed()
						.setColor('#ffff00')
						.setTitle('⚠️ **Uh Oh! That was unexpected!**')
						// eslint-disable-next-line no-undef
						.setDescription('There seems to be an error and we\'re working on a fix!')
						.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``)
						.setFooter(err.response.data.errorCode);

					h.edit('', errormessage1);
				});

				const id = response.data.id;
				const displayname = response.data.displayName;
				const fname = response.data.name;
				const email = response.data.email;
				const lastlogin = response.data.lastLogin;
				const dischanges = response.data.numberOfDisplayNameChanges;
				const country = response.data.country;
				const lname = response.data.lastName;
				const pnumber = response.data.phoneNumber;
				const ldisplaychange = response.data.lastDisplayNameChange;
				const canupdaten = response.data.canUpdateDisplayName;
				const canupdatenext = response.data.canUpdateDisplayNameNext;
				const tfa = response.data.tfaEnabled;
				const ever = response.data.emailVerified;

				embed.setTitle(`**${displayname}**'s Info`);
				embed.setAuthor(`${displayname}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
				embed.addField('**Account ID**:', `${id}`, true);
				embed.addField('**Real Name**:', `${fname} ${lname}`, true);
				embed.addField('**Email Address**:', `${email}`, true);
				embed.addField('**Phone Number**:', `${!pnumber ? 'No Phone Number' : pnumber}`, true);
				embed.addField('**Account Country**:', `${country}`, true);
				embed.addField('**Last Login**:', `${moment.utc(lastlogin).format('dddd, MMMM Do YYYY, HH:mm:ss')}`);
				embed.addField('**Display Name Changes**:', `${dischanges}`);
				embed.addField('**Last Display Name Change**:', `${moment.utc(ldisplaychange).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true);
				embed.addField('**Can Update Display Name**:', `${canupdaten}`, true);
				embed.addField('**Can Update Display Name Next**:', `${moment.utc(canupdatenext).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true);
				embed.addField('**Email Verified**:', `${ever}`, true);
				embed.addField('**Has 2FA**:', `${tfa}`, true);

				return h.edit('', { embed: embed });
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
			// eslint-disable-next-line no-undef
				.setDescription('There seems to be an error and we\'re working on a fix!')
				.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``);

			h.edit('', errormessage1);
		}
	},
};
