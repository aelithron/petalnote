import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, MessageFlags, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandBuilder, Snowflake, TextInputBuilder, TextInputStyle } from 'discord.js';
import { JournalMood } from '../../petalnote';

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
  const moodRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(veryHappy, happy, neutral, sad, verySad);
  const askMood = await interaction.reply({ content: `hello, <@${interaction.user.id}>! how are you today?`, components: [moodRow], flags: MessageFlags.Ephemeral, withResponse: true });

  try {
    const moodInteraction = await askMood.resource?.message?.awaitMessageComponent({ filter: (i: { user: { id: Snowflake; }; }) => i.user.id === interaction.user.id, time: 60_000 });
    if (!moodInteraction) {
      console.warn("[bot] couldn't find/get moodInteraction callback!");
      await interaction.editReply({ content: "error: i failed to select your mood! please try again or contact my operator!", components: [] });
      return;
    }
    let mood: JournalMood;
    switch (moodInteraction.customId) {
      case 'new-veryHappy':
        mood = 'Very Happy'
        break;
      case 'new-happy':
        mood = 'Happy'
        break;
      case 'new-neutral':
        mood = 'Neutral'
        break;
      case 'new-sad':
        mood = 'Sad'
        break;
      case 'new-verySad':
        mood = 'Very Sad'
        break;
      default:
        console.warn(`[bot] failed to select mood: invalid button id! (${moodInteraction.customId})`);
        moodInteraction.update({ content: "error: i failed to select your mood! please try again or contact my operator!", components: [] });
        return;
    }
    const yesJournal = new ButtonBuilder()
      .setCustomId('new-yes-journal')
      .setLabel('Yes')
      .setStyle(ButtonStyle.Success);
    const noJournal = new ButtonBuilder()
      .setCustomId('new-no-journal')
      .setLabel('No')
      .setStyle(ButtonStyle.Danger);
    const journalRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(yesJournal, noJournal);
    const askJournaling = await moodInteraction.update({ content: `**mood:** ${mood}\ngot it! would you like to write in your journal?`, components: [journalRow] });
    const journalInteraction = await askJournaling.awaitMessageComponent({ filter: (i: { user: { id: Snowflake; }; }) => i.user.id === interaction.user.id, time: 60_000 });
    if (!moodInteraction) {
      console.warn("[bot] couldn't find/get journalInteraction callback!");
      await interaction.editReply({ content: "error: i failed to get your journaling answer! please try again or contact my operator!", components: [] });
      return;
    }
    let journalEntry: string | null = null
    if (journalInteraction.customId === "new-yes-journal") {
      const enterIntoJournal = new ModalBuilder()
        .setCustomId('new-journal')
        .setTitle('Journal Entry');
      const journalInput = new TextInputBuilder()
        .setCustomId('new-journal-text')
        .setLabel("What would you like to write?")
        .setStyle(TextInputStyle.Paragraph);
      const journalActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(journalInput);
      enterIntoJournal.addComponents(journalActionRow);
      journalInteraction.showModal(enterIntoJournal);
      // still need to capture the modal interaction properly
      await interaction.editReply({ content: `**mood:** ${mood}\n**journal:** *Text box opened*\nthanks, i added this to your journal!`, components: [] });
    } else {
      await journalInteraction.update({ content: `**mood:** ${mood}\n**journal:** *No journal entry*\nthanks, i added this to your journal!`, components: [] });
    }
  } catch {
    await interaction.editReply({ content: "you didn't select something within a minute, so i fell asleep! run `/new` to restart!", components: [] });
  }
};