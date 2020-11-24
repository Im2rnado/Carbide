const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Bot and API Latency!',
	async execute(message, args, client) {
		const embed = new MessageEmbed()
          .setColor('#FF0000')
		      .setTitle('🏓 Pong!')
          .setDescription(`**Latency**: \`${Date.now() - message.createdTimestamp}ms\`\n**API Latency**: \`${Math.round(client.ws.ping)}ms\``);
		return message.channel.send(embed);
	},
};
