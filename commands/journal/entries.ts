import { ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessageFlags, MessagePayload, RestOrArray, SlashCommandBuilder, Snowflake } from "discord.js";
import userCollection from "../../utils/db";
import { ObjectId } from "mongodb";
import { JournalEntry, UserJournal } from "../../petalnote";

export const data = new SlashCommandBuilder()
  .setName('entries')
  .setDescription('see all of your journal entries')
  .addIntegerOption(option =>
    option.setName('page')
      .setDescription('the page to use, defaults to 1')
      .setRequired(false));
//.addStringOption(option =>
//  option.setName('date')
//    .setDescription('date when the entries were added'));
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })

  // TODO: Add filtering logic based on command options

  const currentPage = interaction.options.getInteger('page') || 1;
  const entriesEmbed = await loadEntryPage(currentPage, interaction.user.id);
  await interaction.editReply(entriesEmbed);
};

// a little note: I moved this code out here because it needs to always act the same.
// I have to call this in interactionCreate.ts to allow for navigation.
// thus why most of the command is in another function. - nova
export async function loadEntryPage(page: number, userID: Snowflake): Promise<InteractionEditReplyOptions> {
  let userDoc = await userCollection.findOne({ userID: userID }) as UserJournal;
  if (!userDoc) {
    userDoc = {
      _id: new ObjectId(),
      userID: userID,
      entries: []
    } as UserJournal;
    await userCollection.insertOne(userDoc);
  };
  if (userDoc.entries.length === 0) {
    return { content: 'you don\'t have any journal entries!' };
  };
  const embed = new EmbedBuilder()
    .setColor(0x7932a8)
    .setTitle(`Journal Entries`);
  const entries = await entriesPerPage(userDoc.entries.reverse(), page);
  if (entries.length === 0) {
    return { content: `there are no entries on page ${page}!` };
  }
  const entryButtons: ButtonBuilder[] = [];
  const fields: RestOrArray<APIEmbedField> = [];
  for (const pagedEntry of entries) {
    const entry = pagedEntry.entry;
    fields.push({ name: `${pagedEntry.number} - <t:${Math.floor(entry.createdAt.getTime() / 1000)}>`, value: `**Mood:** ${entry.mood}\n${entry.text ? truncate(entry.text) : '*No text entered*'}` });
    entryButtons.push(new ButtonBuilder()
      .setCustomId(`open-entry-${entry._id}`)
      .setLabel(`${pagedEntry.number}`)
      .setStyle(ButtonStyle.Secondary)
    );
  }
  embed.addFields(fields);

  // note: this won't account for filtering logic the way it is!
  const previousPage = new ButtonBuilder()
    .setCustomId(`lookup-previous-${page}`)
    .setEmoji('⬅️')
    .setStyle(ButtonStyle.Primary);
  const nextPage = new ButtonBuilder()
    .setCustomId(`lookup-next-${page}`)
    .setEmoji('➡️')
    .setStyle(ButtonStyle.Primary);
  if (page <= 1) previousPage.setDisabled(true);
  if (page * 5 >= userDoc.entries.length) nextPage.setDisabled(true);
  const navigationRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(previousPage, nextPage);
  const entryOpenRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(...entryButtons);
  return { embeds: [embed], components: [entryOpenRow, navigationRow] };
}

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
export function truncate(text: string): string {
  const maxLength = 95
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}