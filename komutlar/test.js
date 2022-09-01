const Discord = require ("discord.js")
const ayarlar = require("../ayarlar.json");

exports.run = (client , message) => {

const chewy = new Discord.MessageEmbed()
.setColor("GREEN")
.setDescription(`Bot sorunsuz çalışmaktadır! :tada:`)
.setFooter("Developed by Chewy")
message.react(ayarlar.gem)
message.channel.send(chewy)

};
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: "test"
};

exports.help = {
    name: 'test',
    description: '',
    usage: ''
};
