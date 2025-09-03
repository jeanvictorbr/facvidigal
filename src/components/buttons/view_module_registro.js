// src/components/buttons/view_module_registro.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'view_module_registro',
    async execute(interaction) {
        await interaction.deferUpdate();

        const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guild.id } });

        // ===================================================================
        // CORREÇÃO APLICADA AQUI
        // ===================================================================
        // A verificação agora checa se o título da embed é diferente do valor padrão.
        const embedStatus = config?.registroEmbedTitle && config.registroEmbedTitle !== 'Formulário de Registro' ? '✅ Configurada' : '⚠️ Pendente';
        
        const recruiterRolesConfigured = config?.recrutadorRoleIds && config.recrutadorRoleIds.length > 0;
        const memberRoleConfigured = !!config?.membroRoleId;
        const rolesStatus = recruiterRolesConfigured && memberRoleConfigured ? '✅ Configurados' : '⚠️ Pendente';

        const channelsStatus = (config?.interactionChannelId && config?.logsChannelId) ? '✅ Configurados' : '⚠️ Pendente';
        // ===================================================================

        const embed = new EmbedBuilder()
            .setColor(embedStatus === '✅ Configurada' && rolesStatus === '✅ Configurados' && channelsStatus === '✅ Configurados' ? '#2ecc71' : '#f1c40f')
            .setTitle('📥 Módulo de Registro')
            .setImage(config?.registroEmbedImage || 'https://i.imgur.com/gkahi6j.gif')
            .setDescription('Painel dedicado à configuração do fluxo de entrada de novos membros.')
            .addFields(
                { name: '📝 Status da Embed', value: `\`${embedStatus}\``, inline: true },
                { name: '🎖️ Status dos Cargos', value: `\`${rolesStatus}\``, inline: true },
                { name: '📺 Status dos Canais', value: `\`${channelsStatus}\``, inline: true }
            )
            .setFooter({ text: 'Todos os passos devem estar configurados para o sistema funcionar.' });

        const configButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('registro_config_embed').setLabel('Editar Embed').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
                new ButtonBuilder().setCustomId('registro_config_cargos').setLabel('Definir Cargos').setStyle(ButtonStyle.Secondary).setEmoji('🎖️'),
                new ButtonBuilder().setCustomId('registro_config_canais').setLabel('Definir Canais').setStyle(ButtonStyle.Secondary).setEmoji('📺')
            );
        
        const actionButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('registro_enviar_painel').setLabel('Publicar Registro').setStyle(ButtonStyle.Success).setEmoji('🚀'),
                new ButtonBuilder()
                    .setCustomId('rpainel_view_registros') // Aponta para a tela de seleção de módulos
                    .setLabel('Voltar para Módulos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⬅️')
            );

        await interaction.editReply({
            embeds: [embed],
            components: [configButtons, actionButtons]
        });
    }
};