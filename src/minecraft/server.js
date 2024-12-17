const util = require('minecraft-server-util');
const config = require("../../config.json");

const server = new util.RCON(config.MINECRAFT_SERVER, { port: config.MINECRAFT_RCON, enableSRV: true, timeout: 5000, password: config.MINECRAFT_RCON_PASS }); // These are the default options

server.on('output', (message) => {
  console.log(message);

  // The client must be closed AFTER receiving the message.
  // Closing too early will cause the client to never output
  // any message.
  server.close();
});

function whitelist(username) {
  return server.connect().then(() => doServerCommand(server, 'add', username)) // add to whitelist
    .catch((error) => {
      console.log(error);
      return (404);
    });
}

function delist(username) {
  return server.connect().then(() => doServerCommand(server, 'remove', username)) // remove from whitelist
    .catch((error) => {
      console.log(error);
      return (404);
    });
}

function banUser(username) {
  return server.connect().then(() => doBan(server, username)) // Ban user from the server
    .catch((error) => {
      console.log(error);
      return (404);
    });
}

function doBan(server, username) {
  server.run('ban ' + username);
  server.run('ban .' + username.toLowerCase()); // Only needed if Bedrock users are able to join your Java server
}

function doServerCommand(server, command, username) {
  server.run('whitelist ' + command + ' ' + username);
  server.run('whitelist ' + command + ' .' + username.toLowerCase()); // Only needed if Bedrock users are able to join your Java server
}

module.exports = {
  wList: whitelist,
  dList: delist,
  banU: banUser,
};
