const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
    customId: 'access_select_module',
    async execute(interaction) {
        const moduleId = interaction.values[0];
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`access_set_password_${moduleId}`).setLabel('Definir / Alterar Senha').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`access_remove_password_${moduleId}`).setLabel('Remover Senha').setStyle(ButtonStyle.Danger)
        );
        await interaction.reply({ content: `O que você deseja fazer com este módulo?`, components: [buttons], ephemeral: true });
    }
};