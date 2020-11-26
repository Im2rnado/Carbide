const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = './src/libs/deviceAuthDetails.json';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';

module.exports = {
	name: 'avatar',
	description: 'Returns Party Hub Avatar',
	aliases: ['kairos', 'avi'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Getting Avatar ...');

		try {
			if (fs.existsSync(path)) {

				const auth = new Auth();

				const token = await auth.login(null, '');
				console.log(token);
				const { accountId } = require('../libs/deviceAuthDetails.json');

				// Get Display Name
				let display1 = client.sessions.get(tagName);

				if (!display1) {
					client.sessions.set(tagName, token.displayName);
				}

				display1 = client.sessions.get(tagName);

				const embed = new MessageEmbed().setColor('BLUE');

				if (!args.length) {

					const response = await axios.post(`https://channels-public-service-prod.ol.epicgames.com/api/v1/user/setting?accountId=${accountId}&settingKey=avatar&settingKey=avatarBackground`, {}, { headers: {
						'Content-Type': 'application/json',
                                                'User-Agent': USER_AGENT,
						'Authorization': `Bearer ${token.access_token}`,
					} }).catch((err) => {
						console.error(err);
						h.edit('❌ An Error Has Occured');
					});
					const kairos = response.data[0].value;
					const kcolor = JSON.parse(response.data[1].value);

					embed.setTitle('Your Avatar');
					embed.setImage(`https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
					embed.setColor(`${kcolor[1]}`);
					return h.edit('', { embed: embed });
				}
				else if (args[0] === 'list') {
					const response = await axios.get(`https://channels-public-service-prod.ol.epicgames.com/api/v1/user/${accountId}/setting/avatar/available`, { headers: {
						'Content-Type': 'application/json',
                                                'User-Agent': USER_AGENT,
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
					const keys = response.data;

					const cosmetics = await axios.get('https://fortniteapi.io/items/list', { headers: {
						'Content-Type': 'application/json',
						'Authorization': '4bed3ab6-deb2685e-b3f6e8e5-16cd9f02',
					} }).then((res) => {
						return res.data.items.outfit;
					}).catch((err) => {
						console.error(err);
						const errormessage1 = new MessageEmbed()
							.setColor('#ffff00')
							.setTitle('⚠️ **Uh Oh! That was unexpected!**')
						// eslint-disable-next-line no-undef
							.setDescription('There seems to be an error and we\'re working on a fix!')
							.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``)
							.setFooter(err);

						h.edit('', errormessage1);
					});
					const bed = [];

					keys.forEach((el, index) => {
						const item = el.includes('cid') ? (cosmetics.find(i => i.id.toLowerCase().startsWith(`cid_${el.split('_')[1]}`))) : el;
						bed.push(`${index + 1}. **${!item.name ? item.id : item.name}**`);
					});

					embed.setTitle(`${keys.length} Skins`);
					embed.setDescription(bed);
					return h.edit('', { embed: embed });
				}
			}
			else{
				h.edit('❌ You are not logged in.');
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
