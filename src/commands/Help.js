require('dotenv').config();
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	execute(message, args, client) {
		const { commands } = message.client;

		if (!args.length) {
			const embed = new MessageEmbed()
				.setTitle(':mailbox_with_mail: Hey! Want some help?')
				.setColor('RANDOM')
				.setDescription(`**[Our Website](https://carbide.cf)\n[Commands List](https://github.com/Im2rnado/Carbide-Help)\n[Support Server](https://discord.gg/5pKvUpA)\n[Invite Me](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)**`)
				.addField('Commands', (commands.map(command => command.name).join(' - ')))
				.setFooter(`Send ${process.env.PREFIX}help [command name] to get info on a specific command.`);

			return message.channel.send(embed);
		}

		const name = args.join(' ').toLowerCase();
		let command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			command = commands.filter(c => c.category.toLowerCase() && c.category.toLowerCase() === name);
			const exiss = commands.find(c => c.category.toLowerCase() && c.category.toLowerCase() === (name));
			if (exiss) {
				const embed1 = new MessageEmbed()
					.setTitle(':mailbox_with_mail: ' + args.join(' '))
					.setColor('RANDOM')
					.setFooter('Coded with ❤ by im2rnado');

				command.forEach((el) => {
					embed1.addField(el.name, el.description, true);
				});

				return message.channel.send(embed1);
			}
			const embed1010 = new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`The command **${args.join(' ')}** doesn't exist!`)
				.setFooter('Need Help? Use +help');
			return message.channel.send(embed1010);
		}

		const embed1 = new MessageEmbed()
			.setTitle(':mailbox_with_mail: Command Help')
			.setColor('RANDOM')
			.setFooter('Coded with ❤ by im2rnado');

		embed1.addField('**Command Name**:', `${command.name}`, true);

		if (command.aliases) embed1.addField('**Aliases**:', `${command.aliases.join(', ')}`, true);
		if (command.description) embed1.addField('**Description**:', `${command.description}`);
		if (command.category) embed1.addField('**Category**:', `${command.category}`);
		embed1.addField('**Usage**:', '[Press Me](https://github.com/Im2rnado/Carbide-Help)');

		message.channel.send(embed1);
	},
};
