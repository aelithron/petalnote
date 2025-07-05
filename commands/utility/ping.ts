import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('checks my ping!');
export async function execute(interaction: CommandInteraction) {
	const sent = await interaction.reply({ content: 'pinging...' });
	interaction.editReply(`pong! (${sent.createdTimestamp - interaction.createdTimestamp}ms)`);
};