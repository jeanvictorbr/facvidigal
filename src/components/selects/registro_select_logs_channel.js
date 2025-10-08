// src/components/selects/registro_select_logs_channel.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_logs_channel',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.values[0];

        // CORREÇÃO: Usando 'guildConfig' e o campo 'registroLogsChannelId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { registroLogsChannelId: channelId },
            create: {
                guildId,
                registroLogsChannelId: channelId,
            },
        });

        await interaction.update({
            content: `✅ Canal de logs definido como <#${channelId}>.`,
            components: [],
        });
    },
};