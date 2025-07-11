import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, MessageFlags, RestOrArray, SlashCommandBuilder } from "discord.js";
import userCollection from "../../utils/db";
import { ObjectId } from "mongodb";
import { JournalEntry, UserJournal } from "../../petalnote";

export const data = new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('look up a journal entry')
  .addIntegerOption(option =>
    option.setName('page')
      .setDescription('the page to use, defaults to 1')
      .setRequired(false));
//.addStringOption(option =>
//  option.setName('date')
//    .setDescription('date when the entries were added'));
export async function execute(interaction: ChatInputCommandInteraction) {
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
    .setTitle(`Journal Entries`);
  const currentPage = interaction.options.getInteger('page') || 1;
  const entries = await entriesPerPage(userDoc.entries.reverse(), currentPage);
  if (entries.length === 0) {
    interaction.editReply({ content: `there are no entries on page ${currentPage}!` });
    return;
  }
  const fields: RestOrArray<APIEmbedField> = [];
  for (const pagedEntry of entries) {
    const entry = pagedEntry.entry;
    fields.push({ name: `${pagedEntry.number} - <t:${Math.floor(entry.createdAt.getTime() / 1000)}>`, value: `**Mood:** ${entry.mood}\n${entry.text ? truncate(entry.text) : '*No text entered*'}` });
  }
  embed.addFields(fields);

  // note: this won't account for filtering logic the way it is!
  const previousPage = new ButtonBuilder()
    .setCustomId(`lookup-previous-${currentPage}`)
    .setEmoji('⬅️')
    .setStyle(ButtonStyle.Primary);
  const nextPage = new ButtonBuilder()
    .setCustomId(`lookup-next-${currentPage}`)
    .setEmoji('➡️')
    .setStyle(ButtonStyle.Primary);
  if (currentPage <= 1) previousPage.setDisabled(true);
  if (currentPage * 5 >= userDoc.entries.length) nextPage.setDisabled(true);
  const navigationRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(previousPage, nextPage);

  await interaction.editReply({ embeds: [embed], components: [navigationRow] });
};

type PagedEntry = { number: number, entry: JournalEntry }
async function entriesPerPage(entries: JournalEntry[], page: number): Promise<PagedEntry[]> {
  const startingIndex = (page - 1) * 5;
  const endingIndex = startingIndex + 5;
  const items: PagedEntry[] = [];
  for (let i = startingIndex; i < endingIndex && i < entries.length; i++) {
    const entry = entries[i];
    if (!entry) continue;
    items.push({ number: (i + 1), entry: entry });
  }
  return items;
}

function truncate(text: string): string {
  const maxLength = 100
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
