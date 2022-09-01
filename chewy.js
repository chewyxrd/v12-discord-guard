const Discord = require("discord.js");
const client = new Discord.Client();
const ayarlar = require("./ayarlar.json");
const chalk = require("chalk");
const fs = require("fs");
const db = require("orio.db");
const express = require("express");
require("./util/eventLoader.js")(client);
const app = express();

app.get("/", (request, response) => {
    response.sendStatus(200);
    });
    app.listen(process.env.PORT);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`Chewy Guard Bot Aktif! 7/24 Yapmak İçin: https://discord.gg/GPs3CSzBR8`);
};

////////////////////////////////// KOMUT ALGILAYICI //////////////////////////////////

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    if(Array.isArray(props.conf.aliases) == true) props.conf.aliases.forEach(alias => { 
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

////////////////////////////////// TOKEN //////////////////////////////////

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

client.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

client.login(ayarlar.token);

////////////////////////////////// KANAL KORUMA //////////////////////////////////

client.on("channelDelete", async channel => {
  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id === client.user.id) return;

  if(ayarlar.kanalkoruma) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("Senden habersiz bir kanal silindi!");
    embed.addField("Kanalı silen kullanıcı", " `" + entry.executor.tag + "`");
    embed.addField("Silinen kanal", " `" + channel.name + "`");
    embed.addField("Silinen kanalı & izinleri eski haline getirdim!");
    embed.setThumbnail(entry.executor.avatarURL());
    embed.setColor("RED");
    embed.setFooter("Developed by Chewy");
    client.channels.cache
      .get(ayarlar.kanalkoruma)
      .send(embed)
      .then(channel.clone().then(x => x.setPosition(channel.position)));
  }
});

////////////////////////////////// ROL KORUMA //////////////////////////////////

client.on("roleDelete", async role => {
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
  if (entry.executor.id === client.user.id) return;

  if (ayarlar.rolkoruma) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("Senden habersiz bir rol silindi!");
    embed.addField("Rolü silen kullanıcı", " `" + entry.executor.tag + "`");
    embed.addField("Silinen rol", " `" + role.name + "`");
    embed.addField("Silinen rolü geri açtım ve izinleri düzenledim!");
    embed.setThumbnail(entry.executor.avatarURL());
    embed.setFooter("Developed by Chewy");
    embed.setColor("RED");
    embed.setTimestamp();
    client.channels.cache
      .get(ayarlar.rolkoruma)
      .send(embed)
      .then(
        role.guild.roles.create({
          data: {
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions,
            mentionable: role.mentionable,
            position: role.position
          },
          reason: "Silinen rol açıldı."
        })
      );
  }
});

////////////////////////////////// LOG/MESAJ //////////////////////////////////

client.on("messageDelete", function(msg) {
  let Embed = new Discord.MessageEmbed()
    .setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
    .setDescription(`
    Mesaj sahibi:
    > <@${msg.author.id}>
    Mesaj:
    > ${msg.content}
    `)
    .setTimestamp()
    .setColor("RED")
    .setFooter("User: " + msg.author.id + " | Guild: " + msg.guild.id);
  client.channels.cache.get(ayarlar.mesajlog).send(Embed);
});
client.on("messageUpdate", function(oldMsg, newMsg) {
  if(newMsg.author.bot) return
  let Embed = new Discord.MessageEmbed()
    .setAuthor(newMsg.author.tag, newMsg.author.displayAvatarURL({ dynamic: true }))
    .setDescription(`
    Mesaj sahibi:
    > <@${newMsg.author.id}>
    Mesaj linki:
    > [Tıkla](${newMsg.url})
    Eski mesaj: 
    > ${oldMsg.content}
    Yeni yesaj: 
    > ${newMsg.content}
    `)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.mesajlog).send(Embed);
});
client.on("channelCreate", function(channel) {
  let Embed = new Discord.MessageEmbed()
    .setAuthor(channel.guild.name, "https://cdn.discordapp.com/avatars/" +channel.guild.id +"/" + channel.guild.icon)
    .setDescription(`
   **Senden habersiz bir kanal oluşturuldu!**
   
   > Adı: \`${channel.name}\`
   > ID'si: \`${channel.id}\`
    `)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.mesajlog).send(Embed);
});

////////////////////////////////// LOG/BAN //////////////////////////////////

client.on("guildBanAdd", function(guild, member) {
  let Embed = new Discord.MessageEmbed()
    .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
    .setDescription("**Senden habersiz kullanıcı banlandı!**:\n" + member.tag)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.banlog).send(Embed);
});
client.on("guildBanRemove", function(guild, member) {
  let Embed = new Discord.MessageEmbed()
    .setAuthor(guild.name, guild.iconURL({ dynamic: true }))
    .setDescription("**Kullanıcının banı açıldı:**:\n" + member.tag)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.banlog).send(Embed);
});

////////////////////////////////// LOG/ROL //////////////////////////////////

client.on("roleUpdate", function(oldRole, newRole) {
  console.log(oldRole.permissions)
  let Embed = new Discord.MessageEmbed()
    .setAuthor(newRole.guild.name, newRole.guild.iconURL({ dynamic: true }))
    .setDescription(`
    **Senden habersiz bir rol güncellendi!**
    
    > **Eski hali**
    Adı: \`${oldRole.name}\`
    Rengi: \`${oldRole.color}\`
    Yetkileri: \`${oldRole.permissions.bitfield}\`
    
    > **Yeni hali**
    Adı: \`${newRole.name}\`
    Rengi: \`${newRole.color}\`
    Yetkileri: \`${newRole.permissions.bitfield}\`
    `)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.rollog).send(Embed);
});

client.on("roleCreate", function(role) {
  let Embed = new Discord.MessageEmbed()
    .setAuthor(role.guild.name, role.guild.iconURL({ dynamic: true }))
    .setDescription(`
    **Bir rol oluşturuldu**
    Adı: \`${role.name}\`
    Rengi: \`${role.color}\`
    Yetkileri: \`${role.permissions.bitfield}\`
    `)
    .setTimestamp()
    .setColor("RED")
    .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.rollog).send(Embed);
});

////////////////////////////////// LOG/EMOJİ //////////////////////////////////

client.on("emojiDelete", async emoji => {
  const embed = new Discord.MessageEmbed()
  .setDescription(`
  **Senden habersiz bir emoji silindi**
  
  Emoji adı:
   ${emoji.name}
  Emoji:
   ${emoji}
  Emoji linki:
   [Tıkla](${emoji.url})
  `)
  .setThumbnail(emoji.url)
  .setColor("RED")
  .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.emojilog).send(embed)
  })

client.on("emojiCreate", async emoji => {
  const embed = new Discord.MessageEmbed()
  .setDescription(`
  **Bir emoji oluşturuldı**
  
  Emoji adı:
   ${emoji.name}
  Emoji:
   ${emoji}
  Emoji linki:
   [Tıkla](${emoji.url})
  `)
  .setThumbnail(emoji.url)
  .setColor("RED")
  .setFooter("Developed by Chewy");
  client.channels.cache.get(ayarlar.emojilog).send(embed)
  })

////////////////////////////////// BOTU SESE SOKMA //////////////////////////////////

client.on("ready", () => {
  client.channels.cache.get('SES KANAL ID').join()
  })

  ////////////////////////////////// BOTU SESE SOKMA SON //////////////////////////////////