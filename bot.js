const { Client, ActivityType, Events, GatewayIntentBits, Partials, SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const minecraft = require("./src/minecraft/minecraft");

const config = require("./config.json");
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel],
  presence: {
    status: 'online',
    afk: false,
    activities: [{
      name: 'linktree/whatever goes here',
      type: ActivityType.Custom,
    }]
  }});

commandList = {
  whitelist: function(client) {
    minecraft.wList(client)
  },
  remove: function(client) {
    minecraft.remove(client)
  },
  who: function(client) {
    minecraft.fetch(client);
  },
  ban: function(client) {
    minecraft.ban(client);
  }
}

client.on(Events.ClientReady, async () => {
  const guild = await client.guilds.cache.get(config.GUILD_ID);

  console.log('Ready'); // Can make this say whatever. Just lets you know it's running.

  const whitelist = new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Whitelist yourself for the Minecraft Server')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your full Minecraft username')
        .setRequired(true));

  const remove = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Remove yourself from the Minecraft Server\'s whitelist')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your full Minecraft username')
        .setRequired(true));

  const who = new SlashCommandBuilder()
    .setName('who')
    .setDescription('Get the discord name of the Minecraft player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The Minecraft username')
        .setRequired(true));

  const ban = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban the Minecraft player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('The Minecraft username')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionsBitField.Flags.BanMembers);

  await guild.commands.set([]);
  await guild.commands.create(whitelist);
  await guild.commands.create(remove);
  await guild.commands.create(who);
  await guild.commands.create(ban);
});

client.on('interactionCreate', (ic) => {
  if (!ic.isChatInputCommand()) return;
  commandList[ic.commandName](ic); // Run the slash command
})

client.login(config.BOT_TOKEN).catch(console.error);
