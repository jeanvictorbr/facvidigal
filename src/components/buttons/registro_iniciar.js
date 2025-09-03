// src/components/buttons/registro_iniciar.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'registro_iniciar',
    async execute(interaction) {
        try {
            const modal = new ModalBuilder()
                .setCustomId('registro_modal_submit')
                .setTitle('Formulário de Registro');
            
            // CORREÇÃO: Padronizando o ID
            const rpNameInput = new TextInputBuilder()
                .setCustomId('reg_rp_name') // Mantendo 'reg_rp_name'
                .setLabel('Seu Nome RP (Nome e Sobrenome)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            
            // CORREÇÃO: Padronizando o ID
            const gameIdInput = new TextInputBuilder()
                .setCustomId('reg_game_id') // Mantendo 'reg_game_id'
                .setLabel('Seu ID no Jogo')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(rpNameInput),
                new ActionRowBuilder().addComponents(gameIdInput)
            );
            
            await interaction.showModal(modal);

        } catch (error) {
            console.error(`Erro no botão ${module.exports.customId}:`, error);
        }
    }
};