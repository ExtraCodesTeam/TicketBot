import { ChannelType, PermissionFlagsBits } from "discord.js";

export default {
    id: 'open',
    async run(interaction, client) {
        const data = client.db.get('ticket');
        if (data) {
            const MyTicket = data.filter(t => t.userId === interaction.user.id);
            const chFind = await interaction.guild.channels.cache.get(MyTicket[MyTicket.length - 1].channelId);

            if (MyTicket && chFind) return interaction.reply({
                content: "You already have a ticket opened: <#" + chFind.id + ">",
                ephemeral: true
            });

            let num = client.db.get('num') || 1;
            interaction.guild.channels.create({
                name: 'ticket-' + num,
                type: ChannelType.GuildText,
                parent: client.cnfg.category,
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
                        id: interaction.user.id,
                        deny: [
                            PermissionFlagsBits.AddReactions,
                            PermissionFlagsBits.MentionEveryone
                        ],
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                        ],
                    },
                    {
                        id: client.cnfg.support,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                        ],
                    }
                ],
            })
                .then(async channel => {
                    client.db.set('num', num + 1);
                    interaction.reply({
                        content: 'Yout ticket created: <#' + channel.id + '>',
                        ephemeral: true
                    });
                    channel.send(await client.cnfg.openMessage(interaction, client.cnfg.support));
                    client.db.push('ticket', {
                        channelId: channel.id,
                        userId: interaction.user.id,
                        number: num,
                        isClaimed: false,
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        } else {
            let num = client.db.get('num') || 1;
            interaction.guild.channels.create({
                name: 'ticket-' + num,
                type: ChannelType.GuildText,
                parent: client.cnfg.category,
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
                        id: interaction.user.id,
                        deny: [
                            PermissionFlagsBits.AddReactions,
                            PermissionFlagsBits.MentionEveryone
                        ],
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                        ],
                    },
                    {
                        id: client.cnfg.support,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                        ],
                    }
                ],
            })
                .then(async channel => {
                    client.db.set('num', num + 1);
                    interaction.reply({
                        content: 'Yout ticket created: <#' + channel.id + '>',
                        ephemeral: true
                    });
                    channel.send(await client.cnfg.openMessage(interaction, client.cnfg.support));
                    client.db.push('ticket', {
                        channelId: channel.id,
                        userId: interaction.user.id,
                        number: num,
                        isClaimed: false,
                    });
                })
                .catch(err => {
                    console.error(err);
                });
        }
    },
};