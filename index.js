import { ActivityType, Client, Collection, GatewayIntentBits, PermissionFlagsBits } from 'discord.js';
import { ConfigCE } from './config.js';
import db from '@molo_7/db.json';
import fs from 'fs';
import path from 'path';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions
    ]
});

client.prefix = '$';
client.db = new db("database/ticket.json");
client.cnfg = ConfigCE;
client.interactions = new Collection();

client.once("ready", async () => {
    console.log("client online: " + client.user.username);
    client.user.setActivity(client.prefix + "help", { type: ActivityType.Playing });
});

client.on("messageCreate", async (message) => {
    if (!message.member.permissions.has("Administrator") && !message.member.roles.cache.has(client.cnfg.support)) return;

    if (message.content === client.prefix + "setup") {
        message.delete();
        await message.channel.send(ConfigCE.setup);
    }

    if (message.content.startsWith(client.prefix + 'add')) {
        const user = message.mentions.users.first();
        const data = client.db.get('ticket');
        const ticket = data.find(e => e.channelId === message.channel.id);

        if (ticket) {
            if (!user) return message.reply('Please mention a user to add.');

            message.channel.permissionOverwrites.create(user.id, {
                ViewChannel: true,
                SendMessages: true,
                AddReactions: false,
                MentionEveryone: false
            }).then(() => {
                message.reply(`${user.tag} has been added to the ticket.`);
            }).catch(err => {
                console.error(err);
                message.reply('Failed to add the user to the ticket.');
            });
        }
    }

    if (message.content.startsWith(client.prefix + 'remove')) {
        const user = message.mentions.users.first();
        const data = client.db.get('ticket');
        const ticket = data.find(e => e.channelId === message.channel.id);

        if (ticket) {
            if (!user) return message.reply('Please mention a user to remove.');

            message.channel.permissionOverwrites.delete(user.id).then(() => {
                message.reply(`${user.tag} has been removed from the ticket.`);
            }).catch(err => {
                console.error(err);
                message.reply('Failed to remove the user from the ticket.');
            });
        }
    }

    if (message.content.startsWith(client.prefix + 'close')) {
        const interaction = message;
        interaction.user = message.author;
        const data = client.db.get('ticket');
        if (!data) return interaction.reply({ content: 'No ticket data found.', ephemeral: true });

        const ThisChannel = data.find(t => t.channelId === interaction.channel.id);
        if (!ThisChannel) return interaction.reply({ content: 'This is not a ticket', ephemeral: true });

        const chFound = interaction.guild.channels.cache.get(ThisChannel.channelId);
        if (!chFound) return interaction.reply({ content: 'Channel not found.', ephemeral: true });

        await chFound.edit({
            name: 'close-' + ThisChannel.number,
            parent: client.cnfg.close,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AddReactions
                    ],
                },
                {
                    id: ThisChannel.userId,
                    deny: [
                        PermissionFlagsBits.AddReactions,
                        PermissionFlagsBits.MentionEveryone,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                    ]
                },
                {
                    id: client.cnfg.support,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                    ],
                }
            ],
        });

        const updatedData = data.filter(t => t.channelId !== interaction.channel.id);
        client.db.set('ticket', updatedData);

        await interaction.reply(await client.cnfg.closeMessage(interaction));
    }

    if (message.content.startsWith(client.prefix + 'rename')) {
        const newName = message.content.split(' ').slice(1).join(' ');
        const data = client.db.get('ticket');
        const ticket = data.find(e => e.channelId === message.channel.id);

        if (ticket) {
            if (!newName) return message.reply('Please specify a new name for the ticket.');

            message.channel.setName(newName).then(() => {
                message.reply(`The ticket has been renamed to ${newName}.`);
            }).catch(err => {
                console.error(err);
                message.reply('Failed to rename the ticket.');
            });
        }
    }
    if (message.content === client.prefix + "help") {
        const commandList = [
            "**Commands List:**",
            `- \`${client.prefix}setup\` : Set up the bot configuration.`,
            `- \`${client.prefix}add [@user]\` : Add a user to the ticket.`,
            `- \`${client.prefix}remove [@user]\` : Remove a user from the ticket.`,
            `- \`${client.prefix}close\` : Close the current ticket.`,
            `- \`${client.prefix}rename [new name]\` : Rename the current ticket.`
        ].join("\n");

        message.reply(commandList);
    }
});

const __dirname = path.resolve();
const interactionFiles = fs.readdirSync(path.join(__dirname, 'actions')).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
    const interaction = await import(`./actions/${file}`);
    client.interactions.set(interaction.default.id, interaction.default);
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const command = client.interactions.get(interaction.customId);

    if (!command) return;

    const member = interaction.member;
    if (!member.permissions.has('Administrator') && !member.roles.cache.has(client.cnfg.support)) {
        return interaction.reply({ content: 'You do not have the necessary permissions to use this command.', ephemeral: true });
    }

    try {
        await command.run(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login("MTMwMTIzNjE1NDA2NjE0NTM3MQ.GU5goc.Ie0ms3Mv_io_B7SJ4ELNDYePCYtLYE4tS6SeyA");