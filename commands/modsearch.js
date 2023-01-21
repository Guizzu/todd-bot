const { SlashCommandBuilder } = require('discord.js');
const { ofetch } = require('ofetch')

function formatBytes(a, b = 2) { if (!+a) return "0 Bytes"; const c = 0 > b ? 0 : b, d = Math.floor(Math.log(a) / Math.log(1024)); return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]}` }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modsearch')
		.setDescription('Searches and provides information on the queried mod.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('skyrim')
				.setDescription('Searches and provides information on the queried Skyrim mod.')
				.addStringOption(option => option.setName('query')
					.setDescription(`Search query`)
					.setRequired(true)
					.setAutocomplete(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('fallout4')
				.setDescription('Searches and provides information on the queried Fallout 4 mod.')
				.addStringOption(option => option.setName('query')
					.setDescription(`Search query`)
					.setRequired(true)
					.setAutocomplete(true))),
	async autocomplete(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const focusedValue = interaction.options.getFocused();
		const fetch = await ofetch(`https://api.bethesda.net/mods/ugc-workshop/list/?number_results=20&order=desc&page=1&platform=XB1&product=${subcommand}&sort=popular-day&text=${focusedValue}`, { retry: 3 }).catch(() => null);
		if (!fetch) return;
		const data = fetch.platform.response.content;
		await interaction.respond(
			data.map(choice => ({ name: `${choice.name.substring(0, 60)}  (${choice.username})`, value: choice.content_id })),
		).catch(() => null);
	},
	async execute(interaction) {
		const value = interaction.options.getString('query');
		const fetch = await ofetch(`https://api.bethesda.net/mods/ugc-workshop/content/get?content_id=${value}`, { retry: 3 }).catch(() => null);
		if (!fetch) return interaction.reply(({ content: 'No data found.', ephemeral: true })).catch(() => null);
		const data = fetch.platform.response.content;
		return interaction.reply({
			"embeds": [
				{
					"type": "rich",
					"title": data.name,
					"description": `${data.description.substring(0, 200)}...`,
					"color": 0x00FFFF,
					"url": `https://mods.llo.app/${data.content_id}`,
					"author": {
						"name": data.username,
						"url": `https://mods.bethesda.net/en/${data.product.toLowerCase()}?author_username=${data.username}`
					},
					"thumbnail": {
						"url": data.preview_file_url
					},
					"footer": {
						"text": `${formatBytes(data.depot_size)} • ${data.follower_count.toLocaleString()} favorites`
					}
				}
			]
		}).catch(() => null);
	}
};
