// src/components/buttons/registro_enviar_painel.js
const { ButtonStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
    customId: 'registro_enviar_painel',
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        try {
            const config = await client.prisma.guildConfig.findUnique({
                where: { guildId },
            });

            // --- VERIFICAÇÕES DETALHADAS ---
            if (!config) {
                return await interaction.editReply({
                    content: '❌ As configurações de registro ainda não foram iniciadas para este servidor. Use o painel de configuração primeiro.',
                    ephemeral: true
                });
            }

            const missingSettings = [];
            if (!config.registroChannelId) missingSettings.push('Canal de Interação');
            if (!config.registroLogsChannelId) missingSettings.push('Canal de Logs');
            if (!config.registroMembroRoleId) missingSettings.push('Cargo de Membro');
            // --- LINHA CORRIGIDA ---
            if (!config.recrutador_roles || config.recrutador_roles.length === 0) missingSettings.push('Cargo de Recrutador');
            // --- FIM DA CORREÇÃO ---

            if (missingSettings.length > 0) {
                const errorMessage = `❌ Impossível publicar o painel. As seguintes configurações estão em falta:\n- **${missingSettings.join('**\n- **')}**\n\nPor favor, configure todos os canais e cargos necessários antes de publicar.`;
                return await interaction.editReply({
                    content: errorMessage,
                    ephemeral: true
                });
            }
            // --- FIM DAS VERIFICAÇÕES ---

            const targetChannel = await interaction.guild.channels.fetch(config.registroChannelId);
            if (!targetChannel) {
                return await interaction.editReply({ content: '❌ O canal de interação configurado não foi encontrado ou foi excluído.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(config.registroEmbedTitle || 'PAINEL DE REGISTRO')
                .setDescription(config.registroEmbedDescription || 'Clique no botão abaixo para iniciar o seu processo de registro em nossa facção.')
                .setColor(config.registroEmbedColor || '#0099ff')
                .setImage(config.registroEmbedImageURL || null);

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
            // Este catch agora só atuará em erros verdadeiramente inesperados
            console.error('Erro ao publicar painel de registro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro inesperado ao buscar as configurações ou enviar o painel. Verifique minhas permissões no canal de destino.', ephemeral: true });
        }
    },
};