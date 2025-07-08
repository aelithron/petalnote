import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { ClientWithCommands, Command, } from './petalnote';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

dotenv.config({ quiet: false });
if (!process.env.BOT_TOKEN) {
  console.error("[bot] missing BOT_TOKEN in your environment variables!");
  process.exit(1);
}
const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ClientWithCommands;
client.commands = await loadCommands();
await loadEvents();
client.login(process.env.BOT_TOKEN);

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

export async function loadEvents() {
  const eventsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(pathToFileURL(filePath).href);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }
}