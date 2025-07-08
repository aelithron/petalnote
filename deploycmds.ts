import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'node:url';
dotenv.config();

const token = process.env.BOT_TOKEN;
const clientId = process.env.CLIENT_ID;
if (!token || !clientId) {
	console.error("[cmd-deploy] missing BOT_TOKEN or CLIENT_ID in your environment variables!");
	process.exit(1);
}

const commands: any[] = [];
const foldersPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(pathToFileURL(filePath).href);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.warn(`[cmd-deploy] the command at ${filePath} is missing a required "data" or "execute" property!`);
		}
	}
}

const rest = new REST().setToken(token);
(async () => {
	try {
		console.log(`[cmd-deploy] started refreshing ${commands.length} application (/) commands...`);
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`[cmd-deploy] successfully reloaded ${(data as any).length} application (/) commands :D`);
		process.exit(0);
	} catch (error) {
		console.error("[cmd-deploy]", error);
	}
})();