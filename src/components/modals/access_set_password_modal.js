// src/components/modals/access_set_password_modal.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'access_set_password_modal', // Será lido com startsWith
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const moduleId = interaction.customId.split('_').pop();
        const newPassword = interaction.fields.getTextInputValue('module_password');

        try {
            await prisma.moduleStatus.update({
                where: { id: moduleId },
                data: {
                    password: newPassword || null // Salva null se o campo estiver vazio
                }
            });

            if (newPassword) {
                await interaction.editReply('✅ Senha definida com sucesso!');
            } else {
                await interaction.editReply('✅ Senha removida com sucesso!');
            }

        } catch (error) {
            console.error("Erro ao definir senha de módulo:", error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar salvar a senha.');
        }
    }
};