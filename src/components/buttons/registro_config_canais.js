// src/components/buttons/registro_config_canais.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_config_canais',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // CORREÇÃO: Lendo de 'guildConfig' e usando os nomes de campo corretos
        const config = await client.prisma.guildConfig.findUnique({
            where: { guildId },
            select: {
                registroChannelId: true,
                registroLogsChannelId: true,
            },
        });

        const interactionChannelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('registro_select_interaction_channel')
            .setPlaceholder('Selecione o canal de interação')
            .addChannelTypes(ChannelType.GuildText);

        if (config?.registroChannelId) {
            interactionChannelSelect.setDefaultChannels([config.registroChannelId]);
        }

        const logsChannelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('registro_select_logs_channel')
            .setPlaceholder('Selecione o canal de logs')
            .addChannelTypes(ChannelType.GuildText);

        if (config?.registroLogsChannelId) {
            logsChannelSelect.setDefaultChannels([config.registroLogsChannelId]);
        }

        await interaction.reply({
            content: 'Selecione os canais para o sistema de registro:',
            components: [
                new ActionRowBuilder().addComponents(interactionChannelSelect),
                new ActionRowBuilder().addComponents(logsChannelSelect),
            ],
            ephemeral: true,
        });
    },
};