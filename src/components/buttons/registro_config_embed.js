// src/components/buttons/registro_config_embed.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'registro_config_embed',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // CORREÇÃO FINAL: Usando os nomes exatos do seu schema
        const config = await client.prisma.guildConfig.findUnique({
            where: { guildId },
            select: {
                registroEmbedTitle: true,
                registroEmbedDesc: true,      // CORRIGIDO
                registroEmbedColor: true,
                registroEmbedImage: true,     // CORRIGIDO
                registroEmbedThumb: true,     // CORRIGIDO
            }
        });

        const modal = new ModalBuilder()
            .setCustomId('registro_modal_embed_config')
            .setTitle('Configuração da Embed de Registro');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('registro_embed_title')
                    .setLabel('Título da Embed')
                    .setValue(config?.registroEmbedTitle || '')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('registro_embed_description')
                    .setLabel('Descrição da Embed')
                    .setValue(config?.registroEmbedDesc || '') // CORRIGIDO
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('registro_embed_color')
                    .setLabel('Cor da Embed (Hexadecimal)')
                    .setValue(config?.registroEmbedColor || '')
                    .setPlaceholder('#0099ff')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('registro_embed_image')
                    .setLabel('URL da Imagem Principal')
                    .setValue(config?.registroEmbedImage || '') // CORRIGIDO
                    .setPlaceholder('https://i.imgur.com/seu-link.png')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('registro_embed_thumb')
                    .setLabel('URL da Thumbnail (Imagem Menor)')
                    .setValue(config?.registroEmbedThumb || '') // CORRIGIDO
                    .setPlaceholder('https://i.imgur.com/seu-link-menor.png')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)
            )
        );

        await interaction.showModal(modal);
    }
};