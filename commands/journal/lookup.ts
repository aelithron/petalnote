import { APIEmbedField, CommandInteraction, EmbedBuilder, MessageFlags, RestOrArray, SlashCommandBuilder } from "discord.js";
import userCollection from "../../utils/db";
import { ObjectId } from "mongodb";
import { UserJournal } from "../../petalnote";

export const data = new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('look up a journal entry')
  .addStringOption(option =>
    option.setName('date')
      .setDescription('date when the entries were added'));
export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  let userDoc = await userCollection.findOne({ userID: interaction.user.id }) as UserJournal;
  if (!userDoc) {
    userDoc = {
      _id: new ObjectId(),
      userID: interaction.user.id,
      entries: []
    } as UserJournal;
    await userCollection.insertOne(userDoc);
  };
  if (userDoc.entries.length === 0) {
    await interaction.editReply("you don't have any journal entries!");
    return;
  };
  
  // TODO: Add filtering logic based on command options

  const embed = new EmbedBuilder()
    .setColor(0x7932a8)
		.setTitle(`Journal Entries`)
  const entries = userDoc.entries; // later: change to "const entries = await entriesPerPage(userDoc.entries, 1);"
  const fields: RestOrArray<APIEmbedField> = [];
  for (const entry of entries) fields.push({ name: entry.createdAt.toDateString(), value: `**Mood:** ${entry.mood}\n${entry.text ? entry.text : '*No text entered*'}` });
  embed.addFields(fields);
  await interaction.editReply({ embeds: [embed] });
};

/*
  async function entriesPerPage(entries: JournalEntry[], page: number): Promise<JournalEntry[]> {
    const pageEntries: JournalEntry[];
    const startingIndex = page * 5;
    for () {}
    return pageEntries;
  }
*/