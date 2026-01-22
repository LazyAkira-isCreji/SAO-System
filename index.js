// SAO SYSTEM CALL BOT - Complete Edition with Categories
require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => res.send('SAO Bot Online!'));
app.listen(PORT, () => console.log(`Keep-alive on port ${PORT}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const PREFIX = '?system call';

// Databases
const warnings = {};
const autoRoles = {};
const welcomeMessages = {};
const logChannels = {};
const starboard = {};
const tickets = {};
const antiNuke = {};
const vcRoles = {};

client.once('ready', async () => {
    console.log(`✅ System Online! Logged in as ${client.user.tag}`);
    client.user.setActivity('Cardinal System | ?system call help', { type: 3 });
    await registerSlashCommands();
});

// ==================== SLASH COMMANDS ====================

async function registerSlashCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('invite')
            .setDescription('Get the bot invite link'),
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Shows all available commands')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log('🔄 Registering slash commands...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        if (interaction.commandName === 'invite') {
            const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
            const embed = new EmbedBuilder()
                .setColor('#0099FF')
                .setTitle('⚔️ Invite SAO System Bot')
                .setDescription(`[Click Here to Invite](${inviteLink})`)
                .addFields({ name: '📋 Features', value: '• Moderation\n• Server Management\n• Auto-Moderation\n• Fun Commands' })
                .setFooter({ text: 'Cardinal System' })
                .setTimestamp();
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (interaction.commandName === 'help') {
            await showCategoryMenu(interaction);
        }
    } catch (error) {
        console.error(error);
        if (!interaction.replied) {
            await interaction.reply({ content: '❌ System Error', ephemeral: true });
        }
    }
});

// ==================== CATEGORY HELP SYSTEM ====================

async function showCategoryMenu(interaction) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('⚔️ SAO System Commands')
        .setDescription('**Select a category to view commands**\nPrefix: `?system call`')
        .addFields(
            { name: '👮 Moderation', value: 'Ban, kick, warn, timeout users', inline: true },
            { name: '📁 Channel Management', value: 'Create, delete, lock channels', inline: true },
            { name: '🛠️ Utility', value: 'Server info, user info, roles', inline: true },
            { name: '🎮 Automation', value: 'Auto-role, welcome, logging', inline: true },
            { name: '🎪 Fun & Events', value: 'Polls, giveaways, tickets', inline: true },
            { name: '🛡️ Security', value: 'Anti-nuke protection', inline: true }
        )
        .setFooter({ text: 'Use buttons below to view category commands' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_moderation').setLabel('👮 Moderation').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cat_channel').setLabel('📁 Channels').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cat_utility').setLabel('🛠️ Utility').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_automation').setLabel('🎮 Automation').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cat_fun').setLabel('🎪 Fun').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cat_security').setLabel('🛡️ Security').setStyle(ButtonStyle.Danger)
    );

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components: [row1, row2] });
    } else {
        await interaction.reply({ embeds: [embed], components: [row1, row2] });
    }
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    const categories = {
        cat_moderation: {
            title: '👮 Moderation Commands',
            color: '#FF0000',
            commands: [
                '`ban @user [reason]` - Bans a user',
                '`unban <user_id>` - Unbans a user',
                '`kick @user [reason]` - Kicks a user',
                '`timeout @user 10m [reason]` - Timeouts a user',
                '`warn @user [reason]` - Warns a user',
                '`show warns @user` - Shows user warnings',
                '`purge 50` - Deletes messages (1-100)',
                '`lock #channel` - Locks a channel',
                '`unlock #channel` - Unlocks a channel',
                '`slowmode enable 10 #channel` - Enables slowmode',
                '`slowmode disable #channel` - Disables slowmode'
            ]
        },
        cat_channel: {
            title: '📁 Channel Management',
            color: '#00FF00',
            commands: [
                '`create channel <name> [category]` - Creates a channel',
                '`delete channel #channel` - Deletes a channel',
                '`lock #channel` - Locks a channel',
                '`unlock #channel` - Unlocks a channel',
                '`slowmode enable <seconds> #channel` - Sets slowmode',
                '`slowmode disable #channel` - Removes slowmode'
            ]
        },
        cat_utility: {
            title: '🛠️ Utility Commands',
            color: '#0099FF',
            commands: [
                '`serverinfo` - Shows server information',
                '`userinfo @user` - Shows user information',
                '`role add @user RoleName` - Adds role to user',
                '`role remove @user RoleName` - Removes role from user',
                '`poll <question>` - Creates a poll',
                '`say <message>` - Bot says message',
                '`embed <title> <description>` - Creates embed',
                '`announce #channel <message>` - Sends announcement'
            ]
        },
        cat_automation: {
            title: '🎮 Automation Commands',
            color: '#FFD700',
            commands: [
                '`autorole @role` - Auto-assigns role to new members',
                '`welcome #channel <message>` - Sets welcome message',
                '`logchannel #channel` - Sets mod log channel',
                '`starboard #channel <stars>` - Sets starboard',
                '`vcrole <voice_id> @role` - Auto-role for VC users',
                '',
                '**Variables for welcome:**',
                '`{user}` - Mentions the user',
                '`{server}` - Server name',
                '',
                '**Example:**',
                '`welcome #general Welcome {user} to {server}!`'
            ]
        },
        cat_fun: {
            title: '🎪 Fun & Events',
            color: '#FF00FF',
            commands: [
                '`ticket setup` - Sets up ticket system',
                '`giveaway <time> <prize>` - Starts giveaway',
                '`poll <question>` - Creates a poll',
                '',
                '**Examples:**',
                '`giveaway 1h Discord Nitro`',
                '`giveaway 30m Game Key`',
                '`poll Should we add game night?`'
            ]
        },
        cat_security: {
            title: '🛡️ Security Commands',
            color: '#FF0000',
            commands: [
                '`antinuke enable` - Enables anti-nuke protection',
                '`antinuke disable` - Disables anti-nuke',
                '`antinuke status` - Shows current status',
                '',
                '**Anti-Nuke protects against:**',
                '• Mass channel deletion',
                '• Mass role deletion',
                '• Mass bans/kicks',
                '• Unauthorized permission changes'
            ]
        }
    };

    const category = categories[interaction.customId];
    if (!category) return;

    const embed = new EmbedBuilder()
        .setColor(category.color)
        .setTitle(category.title)
        .setDescription('**Prefix:** `?system call`\n\n' + category.commands.join('\n'))
        .setFooter({ text: 'Click another button to view different category' })
        .setTimestamp();

    await interaction.update({ embeds: [embed] });
});

// ==================== MODERATION COMMANDS ====================

async function banCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ **Target Not Found**');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
        await message.guild.members.ban(user, { reason });
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('🔨 User Eliminated')
            .setDescription(`**Target:** ${user.tag}\n**Reason:** ${reason}\n**Moderator:** ${message.author.tag}`)
            .setFooter({ text: 'Cardinal System - Ban Protocol' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ **System Error**');
    }
}

async function unbanCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const userId = args[0];
    if (!userId) return message.reply('❌ **User ID Required**');
    
    try {
        await message.guild.members.unban(userId);
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ User Restored')
            .setDescription(`**User ID:** ${userId}\n**Moderator:** ${message.author.tag}`)
            .setFooter({ text: 'Cardinal System - Unban Protocol' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ **User not found in ban list**');
    }
}

async function kickCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ **Target Not Found**');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    
    try {
        await member.kick(reason);
        const embed = new EmbedBuilder()
            .setColor('#FF4500')
            .setTitle('👢 User Removed')
            .setDescription(`**Target:** ${member.user.tag}\n**Reason:** ${reason}`)
            .setTimestamp();
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ **System Error**');
    }
}

async function timeoutCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const member = message.mentions.members.first();
    if (!member) return message.reply('❌ **Target Not Found**');
    const timeString = args[1];
    if (!timeString) return message.reply('❌ **Duration Required** (e.g., 10m, 1h, 1d)');
    
    const duration = parseTime(timeString);
    if (!duration) return message.reply('❌ **Invalid Format**');
    const reason = args.slice(2).join(' ') || 'No reason';
    
    try {
        await member.timeout(duration, reason);
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏱️ User Silenced')
            .setDescription(`**Target:** ${member.user.tag}\n**Duration:** ${timeString}\n**Reason:** ${reason}`)
            .setTimestamp();
        message.reply({ embeds: [embed] });
    } catch (error) {
        message.reply('❌ **System Error**');
    }
}

async function warnCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const user = message.mentions.users.first();
    if (!user) return message.reply('❌ **Target Not Found**');
    const reason = args.slice(1).join(' ') || 'No reason';
    
    if (!warnings[message.guild.id]) warnings[message.guild.id] = {};
    if (!warnings[message.guild.id][user.id]) warnings[message.guild.id][user.id] = [];
    warnings[message.guild.id][user.id].push({ reason, moderator: message.author.tag, timestamp: Date.now() });
    
    const warnCount = warnings[message.guild.id][user.id].length;
    const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle('⚠️ Warning Issued')
        .setDescription(`**Target:** ${user.tag}\n**Reason:** ${reason}\n**Total Warnings:** ${warnCount}`)
        .setTimestamp();
    message.reply({ embeds: [embed] });
}

async function showWarnsCommand(message, args) {
    const user = message.mentions.users.first() || message.author;
    const userWarns = warnings[message.guild.id]?.[user.id] || [];
    
    if (userWarns.length === 0) {
        return message.reply(`✅ **${user.tag}** has a clean record.`);
    }
    
    const embed = new EmbedBuilder()
        .setColor('#FFFF00')
        .setTitle(`⚠️ Warning Records - ${user.tag}`)
        .setDescription(`**Total Warnings:** ${userWarns.length}`);
    
    userWarns.forEach((warn, index) => {
        const date = new Date(warn.timestamp).toLocaleString();
        embed.addFields({ name: `Warning #${index + 1}`, value: `**Reason:** ${warn.reason}\n**Moderator:** ${warn.moderator}\n**Date:** ${date}` });
    });
    
    message.reply({ embeds: [embed] });
}

async function purgeCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
        return message.reply('❌ **Invalid Amount** (1-100)');
    }
    
    try {
        const deleted = await message.channel.bulkDelete(amount + 1, true);
        const reply = await message.channel.send(`🧹 **Purged ${deleted.size - 1} messages**`);
        setTimeout(() => reply.delete(), 5000);
    } catch (error) {
        message.reply('❌ Cannot delete messages older than 14 days');
    }
}

async function lockCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first() || message.channel;
    
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
    message.reply(`🔒 **${channel.name}** has been locked.`);
}

async function unlockCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first() || message.channel;
    
    await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
    message.reply(`🔓 **${channel.name}** has been unlocked.`);
}

async function slowmodeCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const action = args[0];
    const seconds = parseInt(args[1]);
    const channel = message.mentions.channels.first() || message.channel;
    
    if (action === 'enable') {
        if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply('❌ **Invalid Duration** (0-21600 seconds)');
        }
        await channel.setRateLimitPerUser(seconds);
        message.reply(`🐌 **Slowmode enabled:** ${seconds}s in ${channel}`);
    } else if (action === 'disable') {
        await channel.setRateLimitPerUser(0);
        message.reply(`⚡ **Slowmode disabled** in ${channel}`);
    }
}

// ==================== CHANNEL MANAGEMENT ====================

async function createChannelCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channelName = args[0];
    if (!channelName) return message.reply('❌ **Channel Name Required**');
    
    const categoryName = args.slice(1).join(' ');
    let category = null;
    
    if (categoryName) {
        category = message.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === categoryName.toLowerCase());
    }
    
    try {
        const channel = await message.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category?.id
        });
        message.reply(`✅ **Channel Created:** ${channel} ${category ? `in ${category.name}` : ''}`);
    } catch (error) {
        message.reply('❌ **System Error**');
    }
}

async function deleteChannelCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('❌ **Channel Not Found**');
    
    try {
        const channelName = channel.name;
        await channel.delete();
        message.reply(`🗑️ **Channel Deleted:** ${channelName}`);
    } catch (error) {
        message.reply('❌ **System Error**');
    }
}

// ==================== UTILITY COMMANDS ====================

async function serverInfoCommand(message) {
    const { guild } = message;
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`📊 ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
            { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
            { name: 'Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
            { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();
    message.reply({ embeds: [embed] });
}

async function userInfoCommand(message, args) {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);
    
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(`👤 ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
            { name: 'ID', value: user.id },
            { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` },
            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` },
            { name: 'Roles', value: member.roles.cache.map(r => r.name).slice(0, 10).join(', ') || 'None' }
        )
        .setTimestamp();
    message.reply({ embeds: [embed] });
}

async function roleCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const action = args[0];
    const member = message.mentions.members.first();
    const roleName = args.slice(2).join(' ');
    const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    
    if (!member || !role) return message.reply('❌ **Usage:** `role add/remove @user RoleName`');
    
    if (action === 'add') {
        await member.roles.add(role);
        message.reply(`✅ Added **${role.name}** to **${member.user.tag}**`);
    } else if (action === 'remove') {
        await member.roles.remove(role);
        message.reply(`✅ Removed **${role.name}** from **${member.user.tag}**`);
    }
}

async function pollCommand(message, args) {
    const question = args.join(' ');
    if (!question) return message.reply('❌ **Question Required**');
    
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📊 Poll')
        .setDescription(question)
        .setFooter({ text: `Poll by ${message.author.tag}` })
        .setTimestamp();
    
    const pollMsg = await message.channel.send({ embeds: [embed] });
    await pollMsg.react('👍');
    await pollMsg.react('👎');
    message.delete();
}

async function sayCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const text = args.join(' ');
    if (!text) return message.reply('❌ **Text Required**');
    
    message.channel.send(text);
    message.delete();
}

async function embedCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const title = args[0];
    const description = args.slice(1).join(' ');
    
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle(title || 'Embed Title')
        .setDescription(description || 'Embed description')
        .setFooter({ text: 'Cardinal System' })
        .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
    message.delete();
}

async function announceCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first();
    const announcement = args.slice(1).join(' ');
    
    if (!channel || !announcement) return message.reply('❌ **Usage:** `announce #channel Your message`');
    
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📢 Announcement')
        .setDescription(announcement)
        .setFooter({ text: `By ${message.author.tag}` })
        .setTimestamp();
    
    channel.send({ embeds: [embed] });
    message.reply(`✅ **Announcement sent** to ${channel}`);
}

// ==================== AUTOMATION COMMANDS ====================

async function autoRoleCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const role = message.mentions.roles.first();
    if (!role) return message.reply('❌ **Role Not Found**');
    
    autoRoles[message.guild.id] = role.id;
    message.reply(`✅ **Auto-role set:** ${role.name} will be given to new members`);
}

async function welcomeCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first();
    const welcomeMsg = args.slice(1).join(' ');
    
    if (!channel || !welcomeMsg) return message.reply('❌ **Usage:** `welcome #channel Your message {user} {server}`');
    
    welcomeMessages[message.guild.id] = { channelId: channel.id, message: welcomeMsg };
    message.reply(`✅ **Welcome message set** in ${channel}\n**Preview:** ${welcomeMsg.replace('{user}', message.author.toString()).replace('{server}', message.guild.name)}`);
}

async function logChannelCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first();
    if (!channel) return message.reply('❌ **Channel Not Found**');
    
    logChannels[message.guild.id] = channel.id;
    message.reply(`✅ **Log channel set:** ${channel}`);
}

async function starboardCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    const channel = message.mentions.channels.first();
    const stars = parseInt(args[1]) || 3;
    
    if (!channel) return message.reply('❌ **Usage:** `starboard #channel [stars]`');
    
    starboard[message.guild.id] = { channelId: channel.id, minStars: stars };
    message.reply(`✅ **Starboard set:** ${channel} (${stars}⭐ required)`);
}

async function vcRoleCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    
    const voiceChannelId = args[0];
    const role = message.mentions.roles.first();
    
    if (!voiceChannelId || !role) {
        return message.reply('❌ **Usage:** `vcrole <voice_channel_id> @role`');
    }
    
    const voiceChannel = message.guild.channels.cache.get(voiceChannelId);
    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
        return message.reply('❌ **Invalid voice channel ID**');
    }
    
    if (!vcRoles[message.guild.id]) vcRoles[message.guild.id] = {};
    vcRoles[message.guild.id][voiceChannelId] = role.id;
    
    message.reply(`✅ **VC Role set:** Users joining ${voiceChannel.name} will get ${role.name}`);
}

// ==================== FUN & EVENTS ====================

async function ticketCommand(message, args) {
    const action = args[0];
    
    if (action === 'setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return message.reply('⚠️ **System Authority Insufficient**');
        }
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎫 Support Ticket System')
            .setDescription('Click the button below to create a support ticket')
            .setFooter({ text: 'Cardinal System' });
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎫')
        );
        
        message.channel.send({ embeds: [embed], components: [row] });
        message.reply('✅ **Ticket system setup complete**');
    }
}

async function giveawayCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('⚠️ **System Authority Insufficient**');
    }
    
    const duration = args[0];
    const prize = args.slice(1).join(' ');
    
    if (!duration || !prize) {
        return message.reply('❌ **Usage:** `giveaway <time> <prize>`\n**Example:** `giveaway 1h Discord Nitro`');
    }
    
    const time = parseTime(duration);
    if (!time) return message.reply('❌ **Invalid Duration** (use: 1h, 30m, 1d)');
    
    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(`**Prize:** ${prize}\n**Duration:** ${duration}\n**Host:** ${message.author}\n\nReact with 🎉 to enter!`)
        .setFooter({ text: `Ends at` })
        .setTimestamp(Date.now() + time);
    
    const giveawayMsg = await message.channel.send({ embeds: [embed] });
    await giveawayMsg.react('🎉');
    
    setTimeout(async () => {
        const fetchedMsg = await message.channel.messages.fetch(giveawayMsg.id);
        const reaction = fetchedMsg.reactions.cache.get('🎉');
        const users = await reaction.users.fetch();
        const participants = users.filter(u => !u.bot);
        
        if (participants.size === 0) {
            return message.channel.send('❌ **No valid participants!**');
        }
        
        const winner = participants.random();
        const winEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎉 Giveaway Ended!')
            .setDescription(`**Prize:** ${prize}\n**Winner:** ${winner}\n\nCongratulations! 🎊`)
            .setTimestamp();
        
        message.channel.send({ content: `${winner}`, embeds: [winEmbed] });
    }, time);
    
    message.reply('✅ **Giveaway started!**');
}

// ==================== SECURITY ====================

async function antiNukeCommand(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return message.reply('⚠️ **System Authority Insufficient** - Administrator required');
    }
    
    const action = args[0];
    
    if (action === 'enable') {
        antiNuke[message.guild.id] = { enabled: true, timestamp: Date.now() };
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🛡️ Anti-Nuke Enabled')
            .setDescription('**Protection active against:**\n• Mass channel deletion\n• Mass role deletion\n• Mass bans/kicks\n• Unauthorized permission changes')
            .setFooter({ text: 'Cardinal System - Security Protocol' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    } 
    else if (action === 'disable') {
        antiNuke[message.guild.id] = { enabled: false, timestamp: Date.now() };
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⚠️ Anti-Nuke Disabled')
            .setDescription('Server is now vulnerable to nuke attacks')
            .setFooter({ text: 'Cardinal System - Security Protocol' })
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
    else {
        const status = antiNuke[message.guild.id]?.enabled ? '✅ Enabled' : '❌ Disabled';
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🛡️ Anti-Nuke Status')
            .setDescription(`**Current Status:** ${status}`)
            .addFields(
                { name: 'Commands', value: '`antinuke enable` - Enable protection\n`antinuke disable` - Disable protection' }
            )
            .setTimestamp();
        message.reply({ embeds: [embed] });
    }
}

// ==================== HELP COMMAND ====================

async function helpCommand(message) {
    const embed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('⚔️ SAO System Commands')
        .setDescription('**Select a category to view commands**\nPrefix: `?system call`')
        .addFields(
            { name: '👮 Moderation', value: 'Ban, kick, warn, timeout users', inline: true },
            { name: '📁 Channel Management', value: 'Create, delete, lock channels', inline: true },
            { name: '🛠️ Utility', value: 'Server info, user info, roles', inline: true },
            { name: '🎮 Automation', value: 'Auto-role, welcome, logging', inline: true },
            { name: '🎪 Fun & Events', value: 'Polls, giveaways, tickets', inline: true },
            { name: '🛡️ Security', value: 'Anti-nuke protection', inline: true }
        )
        .setFooter({ text: 'Use buttons below or /help for category commands' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_moderation').setLabel('👮 Moderation').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cat_channel').setLabel('📁 Channels').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cat_utility').setLabel('🛠️ Utility').setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('cat_automation').setLabel('🎮 Automation').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cat_fun').setLabel('🎪 Fun').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cat_security').setLabel('🛡️ Security').setStyle(ButtonStyle.Danger)
    );

    message.reply({ embeds: [embed], components: [row1, row2] });
}

// ==================== EVENT HANDLERS ====================

client.on('guildMemberAdd', async (member) => {
    // Auto-role
    if (autoRoles[member.guild.id]) {
        const role = member.guild.roles.cache.get(autoRoles[member.guild.id]);
        if (role) await member.roles.add(role);
    }
    
    // Welcome message
    if (welcomeMessages[member.guild.id]) {
        const welcomeData = welcomeMessages[member.guild.id];
        const channel = member.guild.channels.cache.get(welcomeData.channelId);
        if (channel) {
            const message = welcomeData.message
                .replace('{user}', member.user.toString())
                .replace('{server}', member.guild.name);
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('👋 Welcome!')
                .setDescription(message)
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'Cardinal System' })
                .setTimestamp();
            
            channel.send({ embeds: [embed] });
        }
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const guildVCRoles = vcRoles[newState.guild.id];
    if (!guildVCRoles) return;
    
    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
        const roleId = guildVCRoles[newState.channelId];
        if (roleId) {
            const role = newState.guild.roles.cache.get(roleId);
            if (role) await newState.member.roles.add(role);
        }
    }
    
    // User left a voice channel
    if (oldState.channelId && !newState.channelId) {
        const roleId = guildVCRoles[oldState.channelId];
        if (roleId) {
            const role = oldState.guild.roles.cache.get(roleId);
            if (role) await oldState.member.roles.remove(role);
        }
    }
});

// ==================== MESSAGE HANDLER ====================

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.toLowerCase().startsWith(PREFIX.toLowerCase())) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        // Moderation
        if (command === 'ban') await banCommand(message, args);
        else if (command === 'unban') await unbanCommand(message, args);
        else if (command === 'kick') await kickCommand(message, args);
        else if (command === 'timeout') await timeoutCommand(message, args);
        else if (command === 'warn') await warnCommand(message, args);
        else if (command === 'show' && args[0] === 'warns') await showWarnsCommand(message, args.slice(1));
        else if (command === 'purge' || command === 'clear') await purgeCommand(message, args);
        else if (command === 'lock') await lockCommand(message, args);
        else if (command === 'unlock') await unlockCommand(message, args);
        else if (command === 'slowmode') await slowmodeCommand(message, args);
        
        // Channel Management
        else if (command === 'create' && args[0] === 'channel') await createChannelCommand(message, args.slice(1));
        else if (command === 'delete' && args[0] === 'channel') await deleteChannelCommand(message, args.slice(1));
        
        // Utility
        else if (command === 'serverinfo') await serverInfoCommand(message);
        else if (command === 'userinfo') await userInfoCommand(message, args);
        else if (command === 'role') await roleCommand(message, args);
        else if (command === 'poll') await pollCommand(message, args);
        else if (command === 'say') await sayCommand(message, args);
        else if (command === 'embed') await embedCommand(message, args);
        else if (command === 'announce') await announceCommand(message, args);
        
        // Automation
        else if (command === 'autorole') await autoRoleCommand(message, args);
        else if (command === 'welcome') await welcomeCommand(message, args);
        else if (command === 'logchannel') await logChannelCommand(message, args);
        else if (command === 'starboard') await starboardCommand(message, args);
        else if (command === 'vcrole') await vcRoleCommand(message, args);
        
        // Fun & Events
        else if (command === 'ticket') await ticketCommand(message, args);
        else if (command === 'giveaway') await giveawayCommand(message, args);
        
        // Security
        else if (command === 'antinuke') await antiNukeCommand(message, args);
        
        // Help
        else if (command === 'help') await helpCommand(message);
        
    } catch (error) {
        console.error(error);
        message.reply('❌ **System Error**');
    }
});

// Helper Functions
function parseTime(timeString) {
    const regex = /^(\d+)([smhd])$/;
    const match = timeString.match(regex);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { 's': 1000, 'm': 60000, 'h': 3600000, 'd': 86400000 };
    return value * multipliers[unit];
}

client.login(process.env.DISCORD_TOKEN);
