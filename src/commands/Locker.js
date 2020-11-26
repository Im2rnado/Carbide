const { createCanvas, loadImage } = require('canvas');
const Auth = require('../libs/auth');
const axios = require('axios').default;
const { MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs');
const Endpoints = require('../utils/endpoints');
const path = './src/libs/deviceAuthDetails.json';

module.exports = {
	name: 'locker',
	description: 'Returns Total Skins',
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

		const h = await message.channel.send('Fetching Locker ...');
		const bed = [];
		const parseds = [];

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

				const response = await axios.post(`${Endpoints.PUBLIC_BASE_URL}/game/v2/profile/${accountId}/client/QueryProfile?profileId=athena`, {}, { headers: {
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
						.setDescription('There seems to be an error and we\'re working on a fix!')
						.addField('Error Message: ', `\`\`\`js\n${err}\`\`\``)
						.setFooter(err);

					h.edit('', errormessage1);
				});

				if (!args.length) {
					const object = Object.keys(response.data.profileChanges[0].profile.items);

					// Skins
					for (let i = 0; i < object.length; i++) {
						const item00 = response.data.profileChanges[0].profile.items[object[i]];

						if(item00.templateId.includes('AthenaCharacter')) {
							const splitid = item00.templateId.split(':')[1];
							const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
							const itemn = cosmetics2;
							parseds.push(itemn);
						}
					}

					// Skins
					h.edit(`Rendering \`${parseds.length}\` skins <a:loading:754479771089371318>`);
					await creatLocker(parseds);
					const attachment = new MessageAttachment('./src/final/locker.png');
					message.channel.send(`**${parseds.length} Skins**`, attachment);
				}
				else if (args[0] === 'list') {
					h.edit('Loading Skins <a:loading:754479771089371318>');

					const object = Object.keys(response.data.profileChanges[0].profile.items);

					for (let i = 0; i < object.length; i++) {
						const item = response.data.profileChanges[0].profile.items[object[i]];

						if(item.templateId.includes('AthenaCharacter')) {
							const splitid = item.templateId.split(':')[1];
							console.log(splitid);
							const cosmetics2 = cosmetics.find(it => it.id.toLowerCase() === splitid);
							const itemn = cosmetics2.name;
							bed.push(`${itemn}`);
						}
					}

					embed.setTitle(`${bed.length} Skins`);
					embed.setDescription(bed);
					h.delete();
					message.channel.send(embed);
				}
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

function creatLocker(content) {
	const layers = Math.ceil((content.length) / 7);
	const imageY = layers * 160 + 115;

	const canvas = createCanvas(3000, imageY, 'png');
	const ctx = canvas.getContext('2d');

	// eslint-disable-next-line no-async-promise-executor
	return new Promise(async (resolve) => {
		let featuredX = 60;
		let featuredY = 0;
		let rendered = 0;

		const background = await loadImage('./src/assets/background.png');
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		for(const itemStack in content) {
			const item = content[itemStack];

			const itemImg = await loadImage(item.images.icon).catch((err) => { console.log(err); });

			ctx.drawImage(itemImg, featuredX, featuredY, 260, 260);

			featuredX = featuredX + 260;
			rendered = rendered + 1;
			if(rendered === 11) {
				rendered = 0;
				featuredY = featuredY + 260;
				featuredX = 60;
			}

		}
		const end = fs.createWriteStream('./src/final/locker.png');
			const stream = canvas.createPNGStream().pipe(end);
			stream.on('finish', () => {
				resolve('./src/final/locker.png');
			});

	}).catch((err) => {
		console.error(err);
	});
}
