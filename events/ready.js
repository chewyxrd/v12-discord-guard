const chalk = require('chalk'); 
const moment = require('moment');
const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

var prefix = ayarlar.prefix;

module.exports = client => {
  console.log(`Bot [${client.user.username}] ismi ile giriş yaptı!`)
 setInterval(function() {
}, 8000);
client.user.setPresence({
        game: {
            name: `Chewy Youtube Video`,
            type: 'PLAYING'  
        },
        status: 'online'
    })
    console.log(`Bot aktif oldu kaptan chewy!`);
}
