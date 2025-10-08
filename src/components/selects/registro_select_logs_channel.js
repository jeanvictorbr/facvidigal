// src/components/selects/registro_select_logs_channel.js
module.exports = {
    customId: 'registro_select_logs_channel',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.values[0];

        // CORREÇÃO: Usando 'logsChannelId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { logsChannelId: channelId },
            create: {
                guildId,
                logsChannelId: channelId,
            },
        });

        await interaction.update({
            content: `✅ Canal de logs definido como <#${channelId}>.`,
            components: [],
        });
    },
};