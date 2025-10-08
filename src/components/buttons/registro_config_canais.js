// src/components/buttons/registro_config_canais.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    customId: 'registro_config_canais',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        const config = await client.prisma.guildConfig.findUnique({
            where: { guildId },
            select: {
                interactionChannelId: true,
                logsChannelId: true,
            },
        });

        const interactionChannelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('registro_select_interaction_channel')
            .setPlaceholder('Selecione o canal de interação')
            .addChannelTypes(ChannelType.GuildText);

        if (config?.interactionChannelId) {
            interactionChannelSelect.setDefaultChannels([config.interactionChannelId]);
        }

        const logsChannelSelect = new ChannelSelectMenuBuilder()
            .setCustomId('registro_select_logs_channel')
            .setPlaceholder('Selecione o canal de logs')
            .addChannelTypes(ChannelType.GuildText);

        if (config?.logsChannelId) {
            logsChannelSelect.setDefaultChannels([config.logsChannelId]);
        }

        // --- MELHORIA DE TEXTO ---
        const replyContent = `
### ⚙️ Configuração de Canais do Registro

**1. Canal de Interação:**
*Use o **primeiro menu** para definir o canal onde o painel de registro ficará.*

**2. Canal de Logs:**
*Use o **segundo menu** para definir onde as notificações de novos registros serão enviadas.*
        `;

        await interaction.reply({
            content: replyContent,
            components: [
                new ActionRowBuilder().addComponents(interactionChannelSelect),
                new ActionRowBuilder().addComponents(logsChannelSelect),
            ],
            ephemeral: true,
        });
    },
};