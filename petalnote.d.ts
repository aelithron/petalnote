import { Snowflake } from 'discord.js';
import { ObjectId } from 'mongodb';

export type ClientWithCommands = import('discord.js').Client & {
  commands: import('discord.js').Collection<string, Command>;
}
export type Command = {
  data: import('discord.js').SlashCommandBuilder;
  autocomplete?: (interaction: import('discord.js').AutocompleteInteraction) => Promise<void>;
  execute: (interaction: import('discord.js').CommandInteraction) => Promise<void>;
}

export type UserJournal = {
  _id: ObjectId
  userID: Snowflake
  //doReminders: boolean
  //reminderTime: Date
  entries: JournalEntry[]
}
export type JournalEntry = {
  _id: ObjectId,
  mood: JournalMood
  text: string | null
  createdAt: Date
}
export type JournalMood = 'Very Happy' | 'Happy' | 'Neutral' | 'Sad' | 'Very Sad'