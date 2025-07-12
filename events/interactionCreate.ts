import { ActionRowBuilder, ButtonInteraction, Events, Interaction, MessageFlags, ModalActionRowComponentBuilder, ModalBuilder, ModalMessageModalSubmitInteraction, TextInputBuilder, TextInputStyle } from 'discord.js';
import userCollection from '../utils/db';
import { ClientWithCommands, JournalEntry, UserJournal } from '../petalnote';
import { ObjectId } from 'mongodb';
import { loadEntryPage } from '../commands/journal/entries';

export const name = Events.InteractionCreate;
export async function execute(interaction: Interaction) {
  if (interaction.isChatInputCommand()) {
    const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);
    if (!command) {
      console.error(`[bot] no command matching ${interaction.commandName} was found!`);
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'there was an error while executing this command ;-;', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'there was an error while executing this command ;-;', flags: MessageFlags.Ephemeral });
      }
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith("journal-write-")) {
      const entryId = interaction.customId.split('journal-write-')[1];
      let userDoc = await userCollection.findOne({ userID: interaction.user.id });
      if (!userDoc) {
        userDoc = {
          _id: new ObjectId(),
          userID: interaction.user.id,
          entries: []
        } as UserJournal;
        await userCollection.insertOne(userDoc);
      }
      const entries: JournalEntry[] = userDoc.entries;
      const entryIndex = entries.findIndex(entry => entry._id.equals(entryId));

      const enterIntoJournal = new ModalBuilder()
        .setCustomId(`journal-modal-${entryId}`)
        .setTitle('Journal Entry');
      const journalInput = new TextInputBuilder()
        .setCustomId('journal-text')
        .setLabel("What would you like to write?")
        .setStyle(TextInputStyle.Paragraph);
      if (entries[entryIndex].text != null) {
        journalInput.setPlaceholder(entries[entryIndex].text);
      };
      const journalActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(journalInput);
      enterIntoJournal.addComponents(journalActionRow);
      interaction.showModal(enterIntoJournal);
    } else if (interaction.customId.startsWith("lookup-previous-")) {
      const newPage = Number.parseInt(interaction.customId.split('lookup-previous-')[1]) - 1;
      if (!newPage || Number.isNaN(newPage)) {
        interaction.reply({ content: 'there was an error!' });
        console.error('[bot] error handling navigation in "/entries"! number for previous page was not a number!');
        return;
      }
      const pageEmbed = await loadEntryPage(newPage, interaction.user.id);
      (interaction as ButtonInteraction).update(pageEmbed);
    } else if (interaction.customId.startsWith("lookup-next-")) {
      const newPage = Number.parseInt(interaction.customId.split('lookup-next-')[1]) + 1;
      if (!newPage || Number.isNaN(newPage)) {
        interaction.reply({ content: 'there was an error!' });
        console.error('[bot] error handling navigation in "/entries"! number for next page was not a number!');
        return;
      }
      const pageEmbed = await loadEntryPage(newPage, interaction.user.id);
      (interaction as ButtonInteraction).update(pageEmbed);
    } else return;
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("journal-modal-")) {
      const entryId = interaction.customId.split('journal-modal-')[1];
      const journalText = interaction.fields.getField('journal-text').value;

      let userDoc = await userCollection.findOne({ userID: interaction.user.id });
      if (!userDoc) {
        userDoc = {
          _id: new ObjectId(),
          userID: interaction.user.id,
          entries: []
        } as UserJournal;
        await userCollection.insertOne(userDoc);
      }
      const entries: JournalEntry[] = userDoc.entries;
      const entryIndex = entries.findIndex(entry => entry._id.equals(entryId));
      if (entryIndex !== -1) {
        entries[entryIndex].text = journalText;
        userDoc.entries = entries;
        await userCollection.updateOne(
          { userID: interaction.user.id },
          { $set: { entries: entries } }
        );
        await interaction.reply({ content: 'journal entry writing added! :3', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.reply({ content: 'journal entry couldn\'t be found ;-;', flags: MessageFlags.Ephemeral });
      }
    } else return;
  } else return;
}