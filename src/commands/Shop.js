const Discord = require('discord.js');
const moment = require('moment');
const date = moment().utcOffset('+0200').format('dddd, MMMM Do YYYY');
const axios = require('axios').default;

module.exports = {
	name: 'shop',
	description: 'Returns Fortnite Shop',
	aliases: ['store', 'st'],
	async execute(message) {

		const h = await message.channel.send('Getting Battle Royale Shop ...');

		const embed1 = new Discord.MessageEmbed()
			.setColor('BLUE')
			.setTitle(`🛒 Fortnite Item Shop | ${date}`)
			.setFooter('Use Code: im2rnado', message.author.displayAvatarURL({ dynamic: true }));

		const response = await axios.get('https://fortniteapi.io/v1/shop?lang=en', { headers: {
			'Content-Type': 'application/json',
			'Authorization': '4bed3ab6-deb2685e-b3f6e8e5-16cd9f02',
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

		try {

			const featured = response.data.featured;
			const fembed = [];

			featured.forEach(el => {
				fembed.push(`${el.name} - ${el.price} V-Bucks`);
			});

			embed1.addField('**Featured**', fembed);

			const daily = response.data.daily;
			const dembed = [];

			daily.forEach(el => {
				dembed.push(`${el.name} - ${el.price} V-Bucks`);
			});

			embed1.addField('**Daily**', dembed);

			const offers = response.data.offers;

			if (offers.length) {
				const ofembed = [];

				offers.forEach(el => {
					ofembed.push(`${el.name} - ${el.price} V-Bucks`);
				});

				embed1.addField('**Limited Time Offers**', ofembed);
			}

			const special = response.data.specialFeatured;

			if (special.length) {
				const sembed = [];

				special.forEach(el => {
					sembed.push(`${el.name} - ${el.price} V-Bucks`);
				});

				embed1.addField('**Special**', sembed);
			}

			h.edit('', { embed: embed1 });
		}
		catch(err) {
			return h.edit('Shop is too large, please use `+shopimage` instead');
		}
	},
};
