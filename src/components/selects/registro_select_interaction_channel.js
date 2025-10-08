// src/components/selects/registro_select_interaction_channel.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_interaction_channel',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.values[0];

        // CORREÇÃO: Usando 'guildConfig' e o campo 'registroChannelId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { registroChannelId: channelId },
            create: {
                guildId,
                registroChannelId: channelId,
            },
        });

        await interaction.update({
            content: `✅ Canal de interação definido como <#${channelId}>.`,
            components: [],
        });
    },
};