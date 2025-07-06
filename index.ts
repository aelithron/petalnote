import { ActivityType, Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { ClientWithCommands, Command } from './petalnote';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

dotenv.config();
if (!process.env.BOT_TOKEN) {
  console.error("[bot] missing BOT_TOKEN in your environment variables!");
  process.exit(1);
}
const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ClientWithCommands;
client.commands = await loadCommands();
client.once(Events.ClientReady, readyClient => {
  if (process.argv.includes('--reload-cmds')) import('./deploycmds.ts');
  client.user?.setActivity(`your thoughts and dreams <3`, { type: ActivityType.Listening });
  console.log(`[bot] ready (as: ${readyClient.user.tag}) :3`);
});
client.login(process.env.BOT_TOKEN);

client.on(Events.InteractionCreate, async interaction => {
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
  } else if (interaction.isAutocomplete()) {
    const command = (interaction.client as ClientWithCommands).commands.get(interaction.commandName);
    if (!command) {
      console.error(`[bot] no command matching ${interaction.commandName} was found!`);
      return;
    }
    if (!command.autocomplete) {
      console.error(`[bot] command ${interaction.commandName} does not have an autocomplete function!`);
      return;
    }
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`[bot] ${error}`);
    }
  } else return;
});



export async function loadCommands(): Promise<Collection<string, Command>> {
  const commands: Collection<string, Command> = new Collection();
  const foldersPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
  const commandFolders = fs.readdirSync(foldersPath);
  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = await import(pathToFileURL(filePath).href);
      if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
      } else {
        console.warn(`[bot] the command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
  return commands;
}