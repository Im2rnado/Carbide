const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'token',
	description: 'Generates Access Token',
	aliases: ['generate'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Generating Access Token ...');

		try {
			if (fs.existsSync(path)) {

				const auth = new Auth();

				const token = await auth.login(null, '');
				console.log(token.acce);
				return h.edit(token.access_token);
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
