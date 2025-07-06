import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName('lookup')
  .setDescription('look up a journal entry');
export async function execute(interaction: CommandInteraction) {
  interaction.reply("this command is under development!");
}