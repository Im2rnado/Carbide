const Auth = require('../libs/auth');
const Discord = require('discord.js');
const axios = require('axios').default;
const fs = require('fs');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'logout',
	aliases: ['signout', 'o'],
	description: 'Logs out of your Fortnite Account (Premium Only)',
	async execute(message) {
		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}
		const h = await message.channel.send('Logging out of Epic Services ...');

		try {
			const { accountId, deviceId } = require('../libs/deviceAuthDetails.json');

			const auth = new Auth();

			const token = await auth.login(null, '');
			console.log(token);

			await axios.delete(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/${accountId}/deviceAuth/${deviceId}`, { headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			} }).then((response) => {
				console.error(response);

				fs.unlinkSync(path);

				const embed = new Discord.MessageEmbed();
				embed.setColor('BLUE');
				embed.setTitle('Successfully logged out!');

				return h.edit('', { embed: embed });
			}).catch((err) => {
				console.log(err);
				fs.unlinkSync(path);

				const embed = new Discord.MessageEmbed();
				embed.setColor('BLUE');
				embed.setTitle('Successfully logged out!');

				return h.edit('', { embed: embed });
			});
		}
		catch(err) {
			console.error(err);
			h.edit('❌ You are not logged in.');
		}
	},
};
