import { ActivityType, Client, Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;
export async function execute(client: Client) {
  if (process.argv.includes('--reload-cmds')) import('../deploycmds.ts');
  client.user?.setActivity(`your thoughts and dreams <3`, { type: ActivityType.Listening });
  console.log(`[bot] ready (as: ${client.user!.tag}) :3`);
}