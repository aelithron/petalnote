import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('new')
  .setDescription('add a new journal entry');
export async function execute(interaction: CommandInteraction) {
  const veryHappy = new ButtonBuilder()
    .setCustomId('new-veryHappy')
    .setLabel('Very Happy')
    .setStyle(ButtonStyle.Success);
  const happy = new ButtonBuilder()
    .setCustomId('new-happy')
    .setLabel('Happy')
    .setStyle(ButtonStyle.Success);
  const neutral = new ButtonBuilder()
    .setCustomId('new-neutral')
    .setLabel('Neutral')
    .setStyle(ButtonStyle.Secondary);
  const sad = new ButtonBuilder()
    .setCustomId('new-sad')
    .setLabel('Sad')
    .setStyle(ButtonStyle.Danger);
  const verySad = new ButtonBuilder()
    .setCustomId('new-verySad')
    .setLabel('Very Sad')
    .setStyle(ButtonStyle.Danger);
  const emotionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(veryHappy, happy, neutral, sad, verySad);
  interaction.reply({ content: `hello, <@${interaction.user.id}>! how are you today?`, components: [emotionRow], flags: MessageFlags.Ephemeral });
};