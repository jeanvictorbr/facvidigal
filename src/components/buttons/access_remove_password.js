// src/components/buttons/access_remove_password.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'access_remove_password', // Será lido com startsWith
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const moduleId = interaction.customId.split('_').pop();

        try {
            await prisma.moduleStatus.update({
                where: { id: moduleId },
                data: {
                    password: null // Define a senha como nula (sem senha)
                }
            });

            await interaction.editReply('✅ Senha removida com sucesso! O módulo agora tem acesso livre.');

        } catch (error) {
            console.error("Erro ao remover senha de módulo:", error);
            await interaction.editReply('❌ Ocorreu um erro ao tentar remover a senha.');
        }
    }
};