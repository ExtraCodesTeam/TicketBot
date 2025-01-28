import { ActionRowBuilder, ButtonBuilder, PermissionFlagsBits } from "discord.js";

export default {
    id: 'delete',
    async run(interaction, client) {
        await interaction.channel.delete().catch(err => {
            console.error(err);
            interaction.reply({ content: 'Failed to delete the channel.', ephemeral: true });
        });
    },
};