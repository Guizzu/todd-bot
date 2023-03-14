const fs = require('node:fs');
const path = require('node:path');
const cron = require("node-cron");
const { ofetch } = require('ofetch');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

cron.schedule("*/1 * * * *", async function () {
	let status = 'up';
	const fetch = await ofetch(`https://api.bethesda.net/mods/ugc-workshop/list/?number_results=20&order=asc&page=1&sort=published&product=skyrim&platform=xb1`).catch(() => null);
	if (!fetch) status = 'down';
	client.user.setPresence({
		activities: [{ name: `Bethesda.net is ${status}`, type: ActivityType.Playing }]
	});
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log(`Ready to Serve ${client.guilds.cache.size} Guilds!`);
	console.log(`Listening to ${client.commands.size} Command(s)!`);
	console.log(`${JSON.stringify(client.guilds.cache.map(v => v.name))}`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {

		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isAutocomplete()) {

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return

		try {
			await command.autocomplete(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else return
});

client.login(process.env.TOKEN);
