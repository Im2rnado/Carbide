const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'daily',
	description: 'Claims Daily STW Reward',
	aliases: ['claim', 'stw'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Claiming Daily Reward ...');

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

				const response = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/ClaimLoginReward?profileId=campaign&rvn=-1`, {}, { headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token.access_token}`,
				} }).catch((err) => {
					console.error(err);
					h.edit('❌ You do not own STW!');
				});
				const notification = response.data.notifications[0];
				console.log(notification);

				const items = notification.items;

				if (items.length === 0) {
					embed.setTitle('❎ You have already claimed today\'s reward!');
					embed.setAuthor(`${display1}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
					embed.addField('Days Logged in', `**${notification.daysLoggedIn}**`);
					return h.edit('', { embed: embed });
				}

				const reward = notification.items[0].itemType;
				const quan = notification.items[0].quantity;

				embed.setTitle('✅ Successfully Claimed Daily Reward');
				embed.setAuthor(`${display1}`, `https://cdn2.unrealengine.com/Kairos/portraits/${kairos}.png`);
				embed.addField('Days Logged in', `**${notification.daysLoggedIn}**`);
				embed.addField('Claimed', `**${quan}** x **${reward}**`);
				return h.edit('', { embed: embed });
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
