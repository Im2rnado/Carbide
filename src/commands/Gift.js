/* eslint-disable no-unused-vars */
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
	'Icon Series': '#00FFF6',
	'Shadow Series': '#111111',
	'Slurp Series': '#0c9ea6',
	'Star Wars Series': '#010c62',
	'MARVEL SERIES': '#e20604',
	'DC SERIES': '#002dd0',
	LavaSeries: '#f49d09',
};

module.exports = {
	name: 'gift',
	description: 'Gifts from Item Shop (Premium Only)',
	aliases: ['g'],
	async execute(message, args, client) {
		const tagName = message.author.id;

		// DMs only
		if (message.guild) {
			return message.channel.send('This command only works in DMs.').then(m => m.delete({ timeout: 3900 }))
				.catch(err => {
					console.log(err);
				});
		}

		const h = await message.channel.send('Gifting Item...');

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

				if (!args.length) {
					embed.setTitle('What do you wanna gift??');
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

						const Bfilter = m => m.author.id === message.author.id;
						h.edit('Please reply to this message with the Account Name you want to gift within 30 seconds.').then(r => r.delete({ timeout: 30000 }));
						const Bchannel = message.author.dmChannel || await message.author.createDM();
						Bchannel.awaitMessages(Bfilter, { max: 1, time: 30000 }).then(async Bcollected => {
							if (!Bcollected.first()) return message.channel.send('❌ You didn\'t reply, Gift Cancelled!');

							const uri = Bcollected.first();
							const bItem = encodeURI(uri);

							const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`,
							} }).catch((err) => {
								console.error(err);
								i.edit('❌ An Error Has Occured');
							});
							const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

							const regionEmbed = new MessageEmbed()
								.setTitle('**Confirm Gift**')
								.setColor(Rarities[item.rarity])
								.addField('Item', item.name, true)
								.addField('Price', `<:vbucks:755030644056260651> ${item.price}`, true)
								.addField('Receiver', bItem, true)
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

										const f = await message.channel.send(`Gifting ${item.name} ...`);

										const reponse7 = await axios.get(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${bItem}`, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Uh Oh! That was unexpected!**')
												.setDescription('There seems to be an error and we\'re working on a fix!')
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											f.edit('', errormessage1);
											const errormessage2 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
												.setDescription(`Command Used: **${message.content}**`)
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											client.channels.cache.get('743242297260507166').send(errormessage2);
										});

										const accId = reponse7.data.id;

										await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/GiftCatalogEntry?profileId=common_core`, {
											'offerId': item.offer,
											'purchaseQuantity': 1,
											'currency': 'MtxCurrency',
											'currencySubType': '',
											'expectedTotalPrice': item.price,
											'gameContext': '',
											'receiverAccountIds': [
												accId,
											],
											'giftWrapTemplateId': 'GiftBox:gb_default',
											'personalMessage': 'Gifted using Llama47 Discord Bot',
										}, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).then((response) => {
											console.log(response);

											const embedb = new MessageEmbed()
												.setTitle(`✅ Succefully gifted **${item.name}** to **${bItem}**`)
												.setColor('GREEN');
											f.edit('', { embed: embedb });
										}).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Gift Failed!**')
												.setDescription('It looks like you can\'t gift this item! If you think its a problem on our side.')
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
										message.channel.send('❌ Gift Cancelled!');
									}
								});
						}).catch(Bcollected => {
							message.channel.send('❌ You didn\'t reply, Gift Cancelled!');
						});
					}
					else if (item2) {
						console.log(item2.offer);

						const Bfilter = m => m.author.id === message.author.id;
						h.edit('Please reply to this message with the Account Name you want to gift within 30 seconds.').then(r => r.delete({ timeout: 30000 }));
						const Bchannel = message.author.dmChannel || await message.author.createDM();
						Bchannel.awaitMessages(Bfilter, { max: 1, time: 30000 }).then(async Bcollected => {
							if (!Bcollected.first()) return message.channel.send('❌ You didn\'t reply, Gift Cancelled!');

							const uri = Bcollected.first();
							const bItem = encodeURI(uri);

							const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`,
							} }).catch((err) => {
								console.error(err);
								f.edit('❌ An Error Has Occured');
							});
							const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

							const regionEmbed = new MessageEmbed()
								.setTitle('**Confirm Gift**')
								.setColor(Rarities[item2.rarity])
								.addField('Item', item2.name, true)
								.addField('Price', `<:vbucks:755030644056260651> ${item2.price}`, true)
								.addField('Receiver', bItem, true)
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

										const f = await message.channel.send(`Gifting ${item2.name} ...`);

										const reponse7 = await axios.get(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${bItem}`, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Uh Oh! That was unexpected!**')
												.setDescription('There seems to be an error and we\'re working on a fix!')
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											f.edit('', errormessage1);
											const errormessage2 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
												.setDescription(`Command Used: **${message.content}**`)
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											client.channels.cache.get('743242297260507166').send(errormessage2);
										});

										const accId = reponse7.data.id;

										await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/GiftCatalogEntry?profileId=common_core`, {
											'offerId': item2.offer,
											'purchaseQuantity': 1,
											'currency': 'MtxCurrency',
											'currencySubType': '',
											'expectedTotalPrice': item2.price,
											'gameContext': '',
											'receiverAccountIds': [
												accId,
											],
											'giftWrapTemplateId': 'GiftBox:gb_default',
											'personalMessage': 'Gifted using Llama47 Discord Bot',
										}, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).then((response) => {
											console.log(response);

											const embedb = new MessageEmbed()
												.setTitle(`✅ Succefully gifted **${item2.name}** to **${bItem}**`)
												.setColor('GREEN');
											f.edit('', { embed: embedb });
										}).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Gift Failed!**')
												.setDescription('It looks like you can\'t gift this item! If you think its a problem on our side!')
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
										message.channel.send('❌ Gift Cancelled!');
									}
								});
						}).catch(Bcollected => {
							message.channel.send('❌ You didn\'t reply, Gift Cancelled!');
						});
					}
					else if (item3) {
						console.log(item3.offer);

						const Bfilter = m => m.author.id === message.author.id;
						h.edit('Please reply to this message with the Account Name you want to gift within 30 seconds.').then(r => r.delete({ timeout: 30000 }));
						const Bchannel = message.author.dmChannel || await message.author.createDM();
						Bchannel.awaitMessages(Bfilter, { max: 1, time: 30000 }).then(async Bcollected => {
							if (!Bcollected.first()) return message.channel.send('❌ You didn\'t reply, Gift Cancelled!');

							const uri = Bcollected.first();
							const bItem = encodeURI(uri);

							const response1 = await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=common_core&rvn=-1`, {}, { headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${token}`,
							} }).catch((err) => {
								console.error(err);
								f.edit('❌ An Error Has Occured');
							});
							const sac = response1.data.profileChanges[0].profile.stats.attributes.mtx_affiliate;

							const regionEmbed = new MessageEmbed()
								.setTitle('**Confirm Gift**')
								.setColor(Rarities[item3.rarity])
								.addField('Item', item3.name, true)
								.addField('Price', `<:vbucks:755030644056260651> ${item3.price}`, true)
								.addField('Receiver', bItem, true)
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

										const f = await message.channel.send(`Gifting ${item3.name} ...`);

										const reponse7 = await axios.get(`https://account-public-service-prod.ol.epicgames.com/account/api/public/account/displayName/${bItem}`, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Uh Oh! That was unexpected!**')
												.setDescription('There seems to be an error and we\'re working on a fix!')
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											f.edit('', errormessage1);
											const errormessage2 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle(`**${message.author.tag}** \`(${message.author.id})\` encountered an error!`)
												.setDescription(`Command Used: **${message.content}**`)
												.addField('Error Message: ', `\`\`\`js\n${err.response.data.errorMessage}\`\`\``);

											client.channels.cache.get('743242297260507166').send(errormessage2);
										});

										const accId = reponse7.data.id;

										await axios.post(`${PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/GiftCatalogEntry?profileId=common_core`, {
											'offerId': item3.offer,
											'purchaseQuantity': 1,
											'currency': 'MtxCurrency',
											'currencySubType': '',
											'expectedTotalPrice': item3.price,
											'gameContext': '',
											'receiverAccountIds': [
												accId,
											],
											'giftWrapTemplateId': 'GiftBox:gb_default',
											'personalMessage': 'Gifted using Llama47 Discord Bot',
										}, { headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${token}`,
										} }).then((response) => {
											console.log(response);

											const embedb = new MessageEmbed()
												.setTitle(`✅ Succefully gifted **${item3.name}** to **${bItem}**`)
												.setColor('GREEN');
											f.edit('', { embed: embedb });
										}).catch((err) => {
											console.error(err);
											const errormessage1 = new MessageEmbed()
												.setColor('#ffff00')
												.setTitle('⚠️ **Gift Failed!**')
												.setDescription('It looks like you can\'t gift this item! If you think its a problem on our side.')
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
										message.channel.send('❌ Gift Cancelled!');
									}
								});
						}).catch(Bcollected => {
							message.channel.send('❌ You didn\'t reply, Gift Cancelled!');
						});
					}
					else {
						const errormessage1 = new MessageEmbed()
							.setColor('#ffff00')
							.setTitle('⚠️ **Gift Failed!**')
							.setDescription(`It looks like there isn't any item with the name **${args.join(' ')}**`)
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
				.setTitle('⚠️ **Gift Failed!**')
				.setDescription(`It looks like there isn't any item with the name **${args.join(' ')}**`)
				.setFooter('Please keep in mind that item names are case sensitive');

			message.channel.send(errormessage1);
		}
	},
};
