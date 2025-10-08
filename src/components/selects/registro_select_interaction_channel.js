// src/components/selects/registro_select_interaction_channel.js
module.exports = {
    customId: 'registro_select_interaction_channel',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const channelId = interaction.values[0];

        // CORREÇÃO: Usando 'interactionChannelId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { interactionChannelId: channelId },
            create: {
                guildId,
                interactionChannelId: channelId,
            },
        });

        await interaction.update({
            content: `✅ Canal de interação definido como <#${channelId}>.`,
            components: [],
        });
    },
};