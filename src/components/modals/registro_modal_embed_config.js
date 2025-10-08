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
            color = null; 
        }

        // CORREÇÃO FINAL: Salvando nos campos com nomes exatos
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: {
                registroEmbedTitle: title || null,
                registroEmbedDesc: description || null,      // CORRIGIDO
                registroEmbedColor: color || null,
                registroEmbedImage: image || null,           // CORRIGIDO
                registroEmbedThumb: thumb || null,           // CORRIGIDO
            },
            create: {
                guildId,
                registroEmbedTitle: title,
                registroEmbedDesc: description,      // CORRIGIDO
                registroEmbedColor: color,
                registroEmbedImage: image,           // CORRIGIDO
                registroEmbedThumb: thumb,           // CORRIGIDO
            },
        });

        await interaction.followUp({
            content: '✅ Configurações da embed atualizadas com sucesso!',
            ephemeral: true
        });
    },
};