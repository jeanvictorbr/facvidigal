// src/components/modals/partnerships_modal_submit.js
const prisma = require('../../prisma/client');
const { updatePartnershipEmbed } = require('../../utils/partnershipEmbedUpdater');

module.exports = {
    customId: 'partnerships_modal_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const partnerId = interaction.customId.split('_')[3];
        
        // Coleta os dados do formulário
        const name = interaction.fields.getTextInputValue('p_name');
        const category = interaction.fields.getTextInputValue('p_category');
        const description = interaction.fields.getTextInputValue('p_desc');
        const inviteUrl = interaction.fields.getTextInputValue('p_invite');
        const uniformImageUrl = interaction.fields.getTextInputValue('p_uniform');

        try {
            if (partnerId) { // MODO DE EDIÇÃO
                // A edição não mexe na imagem principal (imageUrl), apenas nos outros dados.
                await prisma.partnership.update({ 
                    where: { id: partnerId }, 
                    data: { name, category, description, inviteUrl, uniformImageUrl } 
                });
                await interaction.editReply(`✅ Parceiro **${name}** atualizado com sucesso!`);

            } else { // MODO DE CRIAÇÃO
                // ===================================================================
                // CORREÇÃO: Removida a tentativa de ler 'p_image'.
                // A imagem principal (imageUrl) será pega das configs padrão se necessário,
                // ou pode ser deixada em branco para ser definida depois.
                // ===================================================================
                const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guild.id } });
                
                await prisma.partnership.create({ 
                    data: { 
                        guildId: interaction.guild.id, 
                        name, 
                        category, 
                        description, 
                        // Usa a imagem padrão das configs ou deixa nulo.
                        imageUrl: config?.partnershipDefaultImageUrl || null, 
                        inviteUrl, 
                        uniformImageUrl 
                    } 
                });
                await interaction.editReply(`✅ Parceiro **${name}** adicionado à categoria **${category}**!`);
            }
            
            await updatePartnershipEmbed(interaction.client, interaction.guild.id);
            
        } catch (error) {
             if (error.code === 'P2002') {
                 return interaction.editReply(`⚠️ Um parceiro com o nome **${name}** já existe.`);
             }
             console.error("Erro ao processar parceria:", error);
             await interaction.editReply('❌ Ocorreu um erro ao salvar os dados.');
        }
    }
};