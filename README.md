# PetalNote
A simple Discord journaling app! :3 \
Bot built for Hack Club's [Converge](https://converge.hackclub.com)!

## User Guide
Installing the bot is simple! Just click [this link](https://discord.com/oauth2/authorize?client_id=1390794347091595314)!
### Commands
- `/new`: Start a new journal entry
- `/entries`: View all of your entries! You can optionally provide a page number to skip to that page, entries are shown in pages of 5.
- `/open (id)`: Open a specific entry by ID. This is generally a development command, but anyone can use it if they have an entry ID.\
(you can get one from selecting an entry in `/entries` and copying the ID at the bottom)
### Some other features
- Editing and deleting entries
- Exporting entries to .txt files
### Security Features
Users can't access the entries of other users. This is made possible with ephemeral messages (Discord's "Only you can see this" messages).
We also use a database structure where the bot can only read the entries of the current user. More is explained in the dev guide.

## Development Guide
Want to run your own instance of PetalNote? Want to improve it, or even just understand it? Well, you've come to the right place :3
### How to Run
Make sure you clone the source code and run `npm install`. However, you also need to global-install Typescript and TSX to run the bot.
Simply run `npm install --global typescript tsx`. This may require sudo/root access.

Next, add your environment variables. Get your Discord bot token and application ID (a guide to making a Discord application is [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)). Add these as `BOT_TOKEN` and `CLIENT_ID`.\
You will also need a MongoDB database. Add a connection string to your DB server as `MONGODB_URI`, and a database for storing the app's data as `MONGODB_DB`.

Finally, just run the command `tsx index.ts --reload-cmds` in the main code directory. Adding `--reload-cmds` means you don't have to run the script to deploy commands, which decreases the chances of breaking the bot. However, you may want to remove it in a development environment, thus why it's a flag.
#### A note on Docker
While a Dockerfile is provided, it is not guaranteed to work in Docker fully yet. If you want to risk it, feel free, otherwise stick to running it as something like a `systemd` service.
#### Auto Restarts
I ***heavily*** suggest enabling automatic restarts in case of failure inside of the tool you use to run the bot. Without them, if the bot crashes due to some error, it could stay offline for a long time.
### Data Security
The bot is built to be quite protective of user data. As it uses a document database (namely MongoDB), with a structure of one user per document, it is hard for user data from other users to get exposed.
This is mainly because this structure means the bot only pulls data from the database for the user that executed the interaction, and thus doesn't read data from other users.
However, as stated in the license, I don't offer any warranty or promises, and I suggest you don't either if you run a public instance of this bot.