// src/components/buttons/registro_enviar_painel.js
const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    customId: 'registro_enviar_painel',
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        try {
            // CORREÇÃO: Buscando também o campo da thumbnail
            const config = await client.prisma.guildConfig.findUnique({
                where: { guildId },
            });

            if (!config) {
                return await interaction.editReply({ 
                    content: '❌ As configurações de registro ainda não foram iniciadas para este servidor.',
                    ephemeral: true 
                });
            }

            const missingSettings = [];
            if (!config.interactionChannelId) missingSettings.push('Canal de Interação');
            if (!config.logsChannelId) missingSettings.push('Canal de Logs');
            if (!config.membroRoleId) missingSettings.push('Cargo de Membro');
            if (!config.recrutadorRoleIds || config.recrutadorRoleIds.length === 0) missingSettings.push('Cargo de Recrutador');

            if (missingSettings.length > 0) {
                const errorMessage = `❌ Impossível publicar o painel. As seguintes configurações estão em falta:\n- **${missingSettings.join('**\n- **')}**`;
                return await interaction.editReply({ content: errorMessage, ephemeral: true });
            }

            const targetChannel = await interaction.guild.channels.fetch(config.interactionChannelId);
            if (!targetChannel) {
                return await interaction.editReply({ content: '❌ O canal de interação configurado não foi encontrado ou foi excluído.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(config.registroEmbedTitle || 'PAINEL DE REGISTRO')
                .setDescription(config.registroEmbedDescription || 'Clique no botão abaixo para iniciar o seu processo de registro.')
                .setColor(config.registroEmbedColor || '#0099ff')
                .setImage(config.registroEmbedImageURL || null)
                .setThumbnail(config.registroEmbedThumbURL || null); // CORREÇÃO: Adicionada a thumbnail

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('registro_iniciar')
                        .setLabel('Iniciar Registro')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('📝'),
                );

            await targetChannel.send({ embeds: [embed], components: [row] });

            await interaction.editReply({ content: `✅ Painel de registro publicado com sucesso no canal ${targetChannel}!`, ephemeral: true });

        } catch (error) {
            console.error('Erro ao publicar painel de registro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro inesperado ao buscar as configurações ou enviar o painel.', ephemeral: true });
        }
    },
};