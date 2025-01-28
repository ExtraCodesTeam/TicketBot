import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "@discordjs/builders";

export const ConfigCE = {
    setup: {
        //content: "", // you can edit content
        embeds: [ // you can edit embeds
            new EmbedBuilder()
                .setTitle("Setup")
                .setDescription('click button to create ticket'),
        ],
        components: [ // don't edit components
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('open')
                        .setLabel('Create Ticket')
                        .setStyle('Secondary')
                )
        ]
    },
    async openMessage(interaction, support) {
        return {
            content: `${interaction.user} - <@&${support}>`, // you can edit content
            embeds: [ // you can edit embeds
                new EmbedBuilder()
                    .setTitle('Welcome To Ticket Support')
                    .setDescription('Wait support team to help you')
            ],
            components: [ // don't edit components
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setLabel('close')
                            .setCustomId('close')
                            .setStyle('Secondary')
                    )
            ]
        }
    },
    async closeMessage(interaction) {
        return {
            embeds: [ // you can edit embeds
                new EmbedBuilder()
                    .setDescription('ticket has been closed by <@' + interaction.user.id + '>')
            ],
            components: [ // don't edit components
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('delete')
                            .setLabel('delete')
                            .setStyle('Danger')
                    )
            ]
        }
    },
    category: '1332096035056779415',
    close: '1332329881261969459',
    support: '1270103049167441971'
}