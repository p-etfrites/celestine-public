const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Create a new Collection to store commands and cooldowns
client.commands = new Collection();
const cooldowns = new Collection();

//Load commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

//Command array
const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Set command in collection
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing required properties.`,
    );
  }
}

//Deploy commands
const rest = new REST().setToken(
  "MTMxNzczNjcwMTE1NzgzODg5MQ.GWP_kQ.x0UNVuAhZ9QcGnZGLFCcmAL2h-gMRgDV1mXzGc",
);

async function deployCommands() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands("1317736701157838891"), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  deployCommands();
});

//Command handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command!",
      ephemeral: true,
    });
  }
});

client.login(process.env.token);

/*const express = require('express');
const app = express();

app.listen(3000, () => {
  console.log('Project is running!');
})

app.get("/" , (req, res) => {
  res.send("Hello world!");
})
const fs = require('node:fs');
const path = require('node:path');
const Discord = require("discord.js");
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS" , "GUILD_MESSAGES"]});
client.on("message", message => {
  if(message.content === "ping") {
    message.channel.send("pong")
  }
})
client.login(process.env.token);
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}*/
