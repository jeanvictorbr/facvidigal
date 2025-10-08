// src/components/modals/registro_modal_embed_config.js
module.exports = {
    customId: 'registro_modal_embed_config',
    async execute(interaction, client) {
        await interaction.deferUpdate({ ephemeral: true });
        const guildId = interaction.guild.id;

        const title = interaction.fields.getTextInputValue('registro_embed_title');
        const description = interaction.fields.getTextInputValue('registro_embed_description');
        let color = interaction.fields.getTextInputValue('registro_embed_color');
        const image = interaction.fields.getTextInputValue('registro_embed_image');
        const thumb = interaction.fields.getTextInputValue('registro_embed_thumb');

        if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
            await interaction.followUp({ content: '❌ A cor fornecida não é um código hexadecimal válido (ex: #FFFFFF).', ephemeral: true });
            color = null; // Invalida a cor para não salvar
        }

        // CORREÇÃO: Salvando nos campos corretos
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: {
                registroEmbedTitle: title || null,
                registroEmbedDescription: description || null,
                registroEmbedColor: color || null,
                registroEmbedImageURL: image || null,      // CORRIGIDO
                registroEmbedThumbURL: thumb || null,      // CORRIGIDO
            },
            create: {
                guildId,
                registroEmbedTitle: title,
                registroEmbedDescription: description,
                registroEmbedColor: color,
                registroEmbedImageURL: image,      // CORRIGIDO
                registroEmbedThumbURL: thumb,      // CORRIGIDO
            },
        });

        await interaction.followUp({
            content: '✅ Configurações da embed atualizadas com sucesso!',
            ephemeral: true
        });
    },
};