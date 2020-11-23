require('dotenv').config();
const fs = require('fs'),
	Discord = require('discord.js'),
	axios = require('axios').default;

const client = new Discord.Client({ partials: ['MESSAGE', 'USER', 'REACTION'] });
client.commands = new Discord.Collection();
client.sessions = new Discord.Collection();

const commandFiles = fs
	.readdirSync(`${__dirname}/commands/`)
	.filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {
	function randomStatus() {
		const status = ['carbide.cf | +help', `${client.users.cache.size} users`];
		const rstatus = Math.floor(Math.random() * status.length);
		client.user.setActivity(status[rstatus], { type: 'WATCHING' });
	} setInterval(randomStatus, 20000);

	console.log('Online!');
});

client.on('message', async message => {

	// Ignore bots and non prefix
	if (message.author.bot || message.content.indexOf(process.env.PREFIX) !== 0) return;

	// Declare args
	const args = message.content.slice(process.env.PREFIX.length).trim().split(/ +/g);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!message.guild && !command) {
		const embed1010 = new Discord.MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`The command **${message.content.slice(process.env.PREFIX.length)}** doesn't exist!`)
			.setFooter('Need Help? Use +help');
		return message.channel.send(embed1010);
	}
	try {
		command.execute(message, args, client);
	}
	catch (error) {
		console.error(error);
		const errormessage1 = new Discord.MessageEmbed()
			.setColor('#ffff00')
			.setTitle('⚠️ **Uh Oh! That was unexpected!**')
			.setDescription(`There seems to be an error and we're working on a fix!`)
			.addField('Error Message: ', `\`\`\`js\n${error}\`\`\``);

		message.channel.send(errormessage1);
	}
});

client.login(process.env.DISCORD_TOKEN);
