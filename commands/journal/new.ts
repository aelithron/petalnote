import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, MessageFlags, SlashCommandBuilder, Snowflake } from 'discord.js';
import { JournalEntry, JournalMood, UserJournal } from '../../petalnote';
import { ObjectId } from 'mongodb';
import userCollection from '../../utils/db';

export const data = new SlashCommandBuilder()
  .setName('new')
  .setDescription('add a new journal entry');
export async function execute(interaction: CommandInteraction) {
  const veryHappy = new ButtonBuilder()
    .setCustomId('new-veryHappy')
    .setLabel('Very Happy')
    .setStyle(ButtonStyle.Success);
  const happy = new ButtonBuilder()
    .setCustomId('new-happy')
    .setLabel('Happy')
    .setStyle(ButtonStyle.Success);
  const neutral = new ButtonBuilder()
    .setCustomId('new-neutral')
    .setLabel('Neutral')
    .setStyle(ButtonStyle.Secondary);
  const sad = new ButtonBuilder()
    .setCustomId('new-sad')
    .setLabel('Sad')
    .setStyle(ButtonStyle.Danger);
  const verySad = new ButtonBuilder()
    .setCustomId('new-verySad')
    .setLabel('Very Sad')
    .setStyle(ButtonStyle.Danger);
  const moodRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(veryHappy, happy, neutral, sad, verySad);
  const askMood = await interaction.reply({ content: `hello, <@${interaction.user.id}>! how are you today?`, components: [moodRow], flags: MessageFlags.Ephemeral, withResponse: true });

  try {
    const moodInteraction = await askMood.resource?.message?.awaitMessageComponent({ filter: (i: { user: { id: Snowflake; }; }) => i.user.id === interaction.user.id, time: 60_000 });
    if (!moodInteraction) {
      console.warn("[bot] couldn't find/get moodInteraction callback!");
      await interaction.editReply({ content: "error: i failed to select your mood! please try again or contact my operator!", components: [] });
      return;
    }
    let mood: JournalMood;
    switch (moodInteraction.customId) {
      case 'new-veryHappy':
        mood = 'Very Happy'
        break;
      case 'new-happy':
        mood = 'Happy'
        break;
      case 'new-neutral':
        mood = 'Neutral'
        break;
      case 'new-sad':
        mood = 'Sad'
        break;
      case 'new-verySad':
        mood = 'Very Sad'
        break;
      default:
        console.warn(`[bot] failed to select mood: invalid button id! (${moodInteraction.customId})`);
        moodInteraction.update({ content: "error: i failed to select your mood! please try again or contact my operator!", components: [] });
        return;
    }

    // break questions, go on to writing to db
    const entryID = new ObjectId();
    let userDoc = await userCollection.findOne({ userID: interaction.user.id });
    if (!userDoc) {
      userDoc = {
        _id: new ObjectId(),
        userID: interaction.user.id,
        entries: []
      } as UserJournal;
      await userCollection.insertOne(userDoc);
    }
    const entries: JournalEntry[] = userDoc.entries;
    entries.push({
      _id: entryID,
      createdAt: new Date(),
      mood: mood,
      text: null
    })
    await userCollection.updateOne(
      { _id: userDoc._id },
      {
        $set: {
          entries: entries
        },
      },
    );
    const writeInJournal = new ButtonBuilder()
      .setCustomId(`new-journal-write-${entryID.toString()}`)
      .setLabel('Write')
      .setEmoji('📝')
      .setStyle(ButtonStyle.Primary);
    const journalRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(writeInJournal);
    await moodInteraction.update({ content: `**mood:** ${mood}\ngot it! your entry has been added!`, components: [journalRow] });
  } catch (e) {
    console.log(e)
    await interaction.editReply({ content: "you didn't select something within a minute, so i fell asleep! run `/new` to restart!", components: [] });
  }
};