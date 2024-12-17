const mcftServer = require('./server.js');
const fs = require('fs');
const config = require("../../config.json");
const _ = require('lodash');

let whitelist;
let minecraftID;
let user;

function checkUser() {
  user = whitelist.find(user => user.minecraftName === minecraftID);
}

function saveData() {
  fs.writeFileSync(config.WHITELIST_JSON, JSON.stringify(whitelist, null, 2));
}

async function fetchUser(client) {
  setUser(client);
  getWhitelist();
  checkUser();

  if (!!user) {
    client.reply({content: minecraftID + ' is ' + '<@!' + user.discordUserID + '>', ephemeral: true});
    const others = whitelist.filter(subUser => subUser.discordUserID === user.discordUserID);

    if (others.length > 1) {
      let names = '';

      for (let i = 1; i < others.length; i++) {
        names += others[i].minecraftName + ' ';
      }

      client.reply({content: 'Other names under this user: ' + names, ephemeral: true});
    }
  } else {
    client.reply({content: minecraftID + ' does not exist or has not yet been added to the whitelist.', ephemeral: true});
  }
}

function getWhitelist() {
  whitelist = JSON.parse(fs.readFileSync(config.WHITELIST_JSON));
}

function setUser(client) {
  minecraftID = client.options.get('username')?.value;
}

async function whitelistMinecraftUser(client) {
  setUser(client);

  if (!!minecraftID) {
    getWhitelist();
    checkUser(); // Check to see if discord user is already whitelisted

    if (!user) { // If this is a fresh Discord user whitelisting
      if (await mcftServer.wList(minecraftID) !== 404) {
        const userObject = {
          discordUserID: client.user.id,
          minecraftName: minecraftID
        };

        whitelist.push(userObject);

        saveData();

        client.reply({
          content: `Congratulations ${minecraftID}! You've been added to the Minecraft server!\nYou can access the server here: ${config.MINECRAFT_SERVER}`, ephemeral: true
        });

      } else {
        client.reply({content: 'The server is currently offline.', ephemeral: true});
      }
    } else {
      client.reply({content: 'That username has already been whitelisted', ephemeral: true});
    }
  } else {
    client.reply({content: 'Something went wrong', ephemeral: true}); // This should be unreachable
  }
}

function isSameUser(client) {
  return user.discordUserID === client.user.id;
}

async function removeUser(client) {
  setUser(client);
  getWhitelist();
  checkUser()

  if (!!user && (isSameUser(client)))  { // Ensure discord user can only delist what they whitelisted
    if (await mcftServer.dList(minecraftID) !== 404) {
      _.remove(whitelist, function(user) {
        return user.minecraftName === minecraftID
      });
      saveData();
      client.reply({content:minecraftID + ' has been removed from the whitelist.', ephemeral: true});
    } else {
      client.reply({content:'The server is currently offline.', ephemeral: true});
    }
  } else {
    client.reply({content:'You have given the wrong Minecraft username. Please try again.', ephemeral: true});
  }
}

async function banUser(client) {
  setUser(client);

  if (await mcftServer.banU(minecraftID) !== 404) {
    client.reply({content:minecraftID + ' has been banned from the server.', ephemeral: true});
  } else {
    client.reply({content:'The server is currently offline.', ephemeral: true});
  }
}

module.exports = {
  fetch: fetchUser,
  wList: whitelistMinecraftUser,
  remove: removeUser,
  ban: banUser,
};
