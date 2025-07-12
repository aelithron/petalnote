import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, EmbedBuilder, InteractionEditReplyOptions, MessageFlags, SlashCommandBuilder, Snowflake } from "discord.js";
import userCollection from "../../utils/db";
import { ObjectId } from "mongodb";
import { UserJournal } from "../../petalnote";

export const data = new SlashCommandBuilder()
  .setName('open')
  .setDescription('(dev) open an entry by id')
  .addStringOption(option =>
    option.setName('id')
      .setDescription('the id for the entry')
      .setRequired(true));
export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral })
  const entryID = interaction.options.getString('id');
  if (!entryID) {
    interaction.reply({ content: 'that entry doesn\'t exist!' });
    return;
  }
  let entryObjectID: ObjectId;
  try {
    entryObjectID = new ObjectId(entryID);
  } catch {
    await interaction.editReply({ content: 'that entry doesn\'t exist!' });
    return;
  }
  const entriesEmbed = await loadSingleEntry(entryObjectID, interaction.user.id);
  await interaction.editReply(entriesEmbed);
};

// this code has to be used by interactionCreate.ts as well as this command
// so i put it in a seperate block, read more about this in entries.ts! - nova
export async function loadSingleEntry(entryID: ObjectId, userID: Snowflake): Promise<InteractionEditReplyOptions> {
  let userDoc = await userCollection.findOne({ userID: userID }) as UserJournal;
  if (!userDoc) {
    userDoc = {
      _id: new ObjectId(),
      userID: userID,
      entries: []
    } as UserJournal;
    await userCollection.insertOne(userDoc);
  };
  const entry = userDoc.entries.find(e => e._id.equals(entryID));
  if (!entry) return { content: 'that entry doesn\'t exist!' }
  const embed = new EmbedBuilder()
    .setColor(0x7932a8)
    .setTitle(`<t:${Math.floor(entry.createdAt.getTime() / 1000)}>`)
    .setDescription(`**Mood:** ${entry.mood}\n${entry.text ? entry.text : '*No text entered*'}\n\n-# (dev) entry id: ${entry._id}`);
  const editEntry = new ButtonBuilder()
    .setCustomId(`journal-write-${entryID.toString()}`)
    .setLabel('Edit Text')
    .setEmoji('📝')
    .setStyle(ButtonStyle.Primary);
  const deleteEntry = new ButtonBuilder()
    .setCustomId(`delete-entry-${entry._id}`)
    .setEmoji('🗑️')
    .setLabel('Delete')
    .setStyle(ButtonStyle.Danger);
  const exportEntry = new ButtonBuilder()
    .setCustomId(`export-entry-${entryID.toString()}`)
    .setLabel('Export')
    .setEmoji('📨')
    .setStyle(ButtonStyle.Secondary);
  const entryActionRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(editEntry, deleteEntry, exportEntry);
  return { embeds: [embed], components: [entryActionRow] };
}