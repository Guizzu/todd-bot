const { SlashCommandBuilder } = require('discord.js');
const { ofetch } = require('ofetch');

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
		.addSubcommand(subcommand =>
			subcommand
				.setName('starfield')
				.setDescription('Searches and provides information on the queried Starfield mod.')
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
		return interaction.reply(`https://mods.bugthesda.net/${data.content_id}`).catch(() => null);
	}
};
