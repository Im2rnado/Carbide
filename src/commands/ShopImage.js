const Discord = require('discord.js');
const axios = require('axios');
const moment = require('moment');
const date = moment().utcOffset('+0200').format('dddd, MMMM Do YYYY');
const fs = require('fs');

const { genratateShop } = require('../functions/shop');

module.exports = {
	name: 'shopimage',
	description: 'Returns Fortnite Shop',
	aliases: ['sm', 'sp', 'si', 'shoppic', 'shopimage', 'shopi'],
	async execute(message) {
		const h = await message.channel.send('Getting Battle Royale Shop ...');


		fs.stat('./src/final/shop.png', async function(err) {
			if(!err) {
				const attachment = new Discord.MessageAttachment('./src/final/shop.png');
				message.channel.send(`**🛒 Fortnite Item Shop | ${date}**`, attachment);
				return h.delete();
			}
			else {
				const itemmss = [];
				const response2 = await axios.get('https://fortniteapi.io/v1/shop?lang=en', { headers: {
					'Content-Type': 'application/json',
					'Authorization': '4bed3ab6-deb2685e-b3f6e8e5-16cd9f02',
				} }).catch((err) => {
					console.error(err);
				});

				const speshal = response2.data.specialFeatured;
				const daaly = response2.data.daily;
				const dataaa = response2.data.featured;

				await speshal.forEach(el => {
					dataaa.push(el);
				});

				await daaly.forEach(el => {
					dataaa.push(el);
				});

				await dataaa.forEach(el => {
					itemmss.push(el.icon.split('transparent.png')[0]);
				});

				await genratateShop(itemmss);

				const attachment = new Discord.MessageAttachment('./src/final/shop.png');
				message.channel.send(`**🛒 Fortnite Item Shop | ${date}**`, attachment);
				h.delete();
			}
		});
	},
};
