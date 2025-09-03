// src/components/selects/registro_select_recrutador_roles.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_recrutador_roles',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        // Pega a LISTA de IDs de cargos selecionados
        const selectedRoleIds = interaction.values;

        await prisma.guildConfig.upsert({
            where: { guildId: interaction.guild.id },
            update: { recrutadorRoleIds: selectedRoleIds },
            create: { guildId: interaction.guild.id, recrutadorRoleIds: selectedRoleIds }
        });
        
        const feedbackMessage = selectedRoleIds.length > 0
            ? `✅ Cargos de recrutador atualizados com sucesso para: ${selectedRoleIds.map(id => `<@&${id}>`).join(', ')}`
            : '✅ Todos os cargos de recrutador foram removidos.';

        await interaction.editReply(feedbackMessage);
    }
};