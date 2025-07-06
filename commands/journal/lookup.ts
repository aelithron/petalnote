import { CommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import userCollection from "../../utils/db";
import { ObjectId } from "mongodb";
import { UserJournal } from "../../petalnote";

export const data = new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('look up a journal entry')
  .addSubcommand(subcommand =>
		subcommand
			.setName('date')
			.setDescription('date when the entries were added')
			.addStringOption(option => option.setName('date').setDescription('a date')));
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
  }
  if (userDoc.entries.length === 0) {
    await interaction.reply("you don't have any journal entries!");
    return;
  }
  await interaction.reply("under development!");
};