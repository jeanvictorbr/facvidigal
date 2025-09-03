// src/components/buttons/access_set_password.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'access_set_password', // Será lido com startsWith
    async execute(interaction) {
        const moduleId = interaction.customId.split('_').pop();
        const module = await prisma.moduleStatus.findUnique({ where: { id: moduleId } });

        if (!module) {
            return interaction.reply({ content: '❌ Módulo não encontrado. Pode ter sido removido.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`access_set_password_modal_${moduleId}`)
            .setTitle(`Senha para: ${module.name}`);

        const passwordInput = new TextInputBuilder()
            .setCustomId('module_password')
            .setLabel('Digite a nova senha')
            .setPlaceholder('Deixe em branco para remover a senha atual')
            .setStyle(TextInputStyle.Short)
            .setRequired(false); // Não é obrigatório para permitir a remoção

        modal.addComponents(new ActionRowBuilder().addComponents(passwordInput));
        await interaction.showModal(modal);
    }
};