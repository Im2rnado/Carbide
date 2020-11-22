/* eslint-disable no-undef */
const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { PUBLIC_BASE_URL } = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

const Rarities = {
	common: '#B1B1B1',
	uncommon: '#319236',
	rare: '#4169e1',
	epic: '#D505FF',
	legendary: '#F68B20',
	dark: '#D505FF',
	'icon series': '#00FFF6',
	'shadow series': '#111111',
	'slurp series': '#0c9ea6',
	'star wars series': '#010c62',
	marvel: '#e20604',
	dc: '#002dd0',
	'lava series': '#f49d09',
	'frozen series': '#72bfe2',
};

module.exports = {
	name: 'buy',
	description: 'Buys from Item Shop (Premium Only)',
	aliases: ['b'],
	async execute(message, args, client) {
		// DMs only

		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Buying Item <a:loading:754479771089371318>');

		try {
			if (fs.existsSync(path)) {

				const auth = new Auth();

				const token = await auth.login(null, '');
				console.log(token);
				const { accountId } = require('../libs/deviceAuthDetails.json');
				const embed = new MessageEmbed().setColor(`${kcolor[1]}`);

				if (!args.length) {
					embed.setTitle('What do you wanna buy??');
					return h.edit('', { embed: embed });
				}
				else {

					const cosmetics = await axios.get('https://fortniteapi.io/v1/shop?lang=en', { headers: {
						'Content-Type': 'application/json',
						'Authorization': '4bed3ab6-deb2685e-b3f6e8e5-16cd9f02',
					} }).catch((err) => {
						console.error(err);
						h.edit('❌ An Error Has Occured');
					});

					const featured = cosmetics.data.featured;
					const daily = cosmetics.data.daily;
					const special = cosmetics.data.specialFeatured;

					const item = featured.find(i => i.name === args.join(' '));
					const item2 = daily.find(i => i.name === args.join(' '));
					const item3 = special.find(i => i.name === args.join(' '));
					if (item) {
						console.log(item.offer);

						const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`,
						} }).catch((err) => {
							console.error(err);
							h.edit('❌ An Error Has Occured');
						});
						const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

						const regionEmbed = new MessageEmbed()
							.setColor(Rarities[item.rarity])
							.setTitle('**Confirm Purchase**')
							.addField('Item', item.name, true)
							.addField('Price', `<:vbucks:755030644056260651> ${item.price}`, true)
							.addField('Creator Supported', sac)
							.setThumbnail(item.image);

						h.delete();

						const i = await message.channel.send(regionEmbed);
						i.react('✅').then(() => i.react('❌'));

						const filter = (reaction, user) => {
							return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
						};

						i.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
							.then(async collected => {
								const reaction = collected.first();

								if (reaction.emoji.name === '✅') {
									await i.delete();

									const f = await message.channel.send(`Buying ${item.name} <a:loading:754479771089371318>`);

									await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/PurchaseCatalogEntry?profileId=common_core`, {
										'offerId': item.offer,
										'purchaseQuantity': 1,
										'currency': 'MtxCurrency',
										'currencySubType': '',
										'expectedTotalPrice': item.price,
										'gameContext': '',
									}, { headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${token}`,
									} }).then((response) => {
										console.log(response);

										const embedb = new MessageEmbed()
											.setTitle(`✅ Succefully purchased **${item.name}**`)
											.setColor('GREEN');
										f.edit('', { embed: embedb });
									}).catch((err) => {
										console.error(err);
										const errormessage1 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle('⚠️ **Purchase Failed!**')
											.setDescription(`It looks like you can't purchase this item! If you think its a problem on our side, [Join our Support Server](${invite}) and report it there.`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										f.edit('', errormessage1);

										const errormessage2 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
											.setDescription(`Command Used: **${message.content}**`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										client.channels.cache.get('743242297260507166').send(errormessage2);
									});
								}
								if (reaction.emoji.name === '❌') {
									await i.delete();
									message.channel.send('❌ Purchase Cancelled!');
								}
							});
					}
					else if (item2) {
						console.log(item2.offer);

						const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`,
						} }).catch((err) => {
							console.error(err);
							h.edit('❌ An Error Has Occured');
						});
						const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

						const regionEmbed = new MessageEmbed()
							.setColor(Rarities[item2.rarity])
							.setTitle('**Confirm Purchase**')
							.addField('Item', item2.name, true)
							.addField('Price', `<:vbucks:755030644056260651> ${item2.price}`, true)
							.addField('Creator Supported', sac)
							.setThumbnail(item2.image);

						h.delete();

						const i = await message.channel.send(regionEmbed);
						i.react('✅').then(() => i.react('❌'));

						const filter = (reaction, user) => {
							return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
						};

						i.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
							.then(async collected => {
								const reaction = collected.first();

								if (reaction.emoji.name === '✅') {
									await i.delete();

									const f = await message.channel.send(`Buying ${item2.name} <a:loading:754479771089371318>`);

									await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/PurchaseCatalogEntry?profileId=common_core`, {
										'offerId': item2.offer,
										'purchaseQuantity': 1,
										'currency': 'MtxCurrency',
										'currencySubType': '',
										'expectedTotalPrice': item2.price,
										'gameContext': '',
									}, { headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${token}`,
									} }).then((response) => {
										console.log(response);

										const embedb = new MessageEmbed()
											.setTitle(`✅ Succefully purchased **${item2.name}**`)
											.setColor('GREEN');
										f.edit('', { embed: embedb });
									}).catch((err) => {
										console.error(err);
										const errormessage1 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle('⚠️ **Purchase Failed!**')
											.setDescription(`It looks like you can't purchase this item! If you think its a problem on our side, [Join our Support Server](${invite}) and report it there.`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										f.edit('', errormessage1);

										const errormessage2 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
											.setDescription(`Command Used: **${message.content}**`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										client.channels.cache.get('743242297260507166').send(errormessage2);
									});
								}
								if (reaction.emoji.name === '❌') {
									await i.delete();
									message.channel.send('❌ Purchase Cancelled!');
								}
							});
					}
					else if (item3) {
						console.log(item3.offer);

						const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${token}`,
						} }).catch((err) => {
							console.error(err);
							h.edit('❌ An Error Has Occured');
						});
						const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

						const regionEmbed = new MessageEmbed()
							.setColor(Rarities[item3.rarity])
							.setTitle('**Confirm Purchase**')
							.addField('Item', item3.name, true)
							.addField('Price', `<:vbucks:755030644056260651> ${item3.price}`, true)
							.addField('Creator Supported', sac)
							.setThumbnail(item3.image);

						h.delete();

						const i = await message.channel.send(regionEmbed);
						i.react('✅').then(() => i.react('❌'));

						const filter = (reaction, user) => {
							return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
						};

						i.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
							.then(async collected => {
								const reaction = collected.first();

								if (reaction.emoji.name === '✅') {
									await i.delete();

									const f = await message.channel.send(`Buying ${item3.name} <a:loading:754479771089371318>`);

									await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/PurchaseCatalogEntry?profileId=common_core`, {
										'offerId': item3.offer,
										'purchaseQuantity': 1,
										'currency': 'MtxCurrency',
										'currencySubType': '',
										'expectedTotalPrice': item3.price,
										'gameContext': '',
									}, { headers: {
										'Content-Type': 'application/json',
										'Authorization': `Bearer ${token}`,
									} }).then((response) => {
										console.log(response);

										const embedb = new MessageEmbed()
											.setTitle(`✅ Succefully purchased **${item3.name}**`)
											.setColor('GREEN');
										f.edit('', { embed: embedb });
									}).catch((err) => {
										console.error(err);
										const errormessage1 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle('⚠️ **Purchase Failed!**')
											.setDescription(`It looks like you can't purchase this item! If you think its a problem on our side, [Join our Support Server](${invite}) and report it there.`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										f.edit('', errormessage1);

										const errormessage2 = new MessageEmbed()
											.setColor('#ffff00')
											.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
											.setDescription(`Command Used: **${message.content}**`)
											.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

										client.channels.cache.get('743242297260507166').send(errormessage2);
									});
								}
								if (reaction.emoji.name === '❌') {
									await i.delete();
									message.channel.send('❌ Purchase Cancelled!');
								}
							});
					}
					else {
						const errormessage1 = new MessageEmbed()
							.setColor('#ffff00')
							.setTitle('⚠️ **Purchase Failed!**')
							.setDescription(`It looks like there isn't any item with the name **${args.join((' '))}**`)
							.setFooter('Please keep in mind that item names are case sensitive');

						return h.edit(' ', errormessage1);
					}
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
				.setTitle('⚠️ **Purchase Failed!**')
				.setDescription(`It looks like there isn't any item with the name **${args.join((' '))}**`)
				.setFooter('Please keep in mind that item names are case sensitive');

			message.channel.send(errormessage1);
		}
	},
};
