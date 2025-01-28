import { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } from "discord.js";

export default {
    id: 'close',
    async run(interaction, client) {
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

        await interaction.update({
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('close')
                            .setCustomId('close')
                            .setStyle('Secondary')
                            .setDisabled(true)
                    )
            ]
        });

        const updatedData = data.filter(t => t.channelId !== interaction.channel.id);
        client.db.set('ticket', updatedData);
        
        await interaction.followUp(await client.cnfg.closeMessage(interaction));
    },
};
