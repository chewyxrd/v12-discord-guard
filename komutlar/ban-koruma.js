const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
  
const chewy = args[0]
if (!chewy) {

const embed = new Discord.MessageEmbed()
.setDescription(`**Ban Koruma** sistemini açmak için: **.ban-koruma aç/kapat** yazmalısın!`)
.setColor('BLACK')
.setFooter("Developed by Chewy")
message.react(ayarlar.no)
return message.channel.send(embed)

}

if (chewy == 'aç') { 
  
const embed = new Discord.MessageEmbed()
.setDescription(`**Ban Koruma** sistemi başarılı bir şekilde açıldı!`)
.setColor('GREEN')
.setFooter("Developed by Chewy")
message.react(ayarlar.yes)
return message.channel.send(embed)
}
  
if (chewy == 'kapat') {

const embed = new Discord.MessageEmbed()
.setDescription(`**Ban Koruma** sistemi başarılı bir şekilde kapatıldı!`)
.setColor('RED')
.setFooter("Developed by Chewy")
message.react(ayarlar.yes)
return message.channel.send(embed)
}
  
};
exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: "ban-koruma"
};

exports.help = {
    name: 'ban-koruma',
    description: '',
    usage: ''
};