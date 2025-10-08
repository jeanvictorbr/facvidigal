// src/components/selects/registro_select_recrutador_role.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_recrutador_role',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const selectedRoles = interaction.values;

        // CORREÇÃO: Usando 'guildConfig' e o campo 'recrutador_roles'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: {
                recrutador_roles: selectedRoles,
            },
            create: {
                guildId,
                recrutador_roles: selectedRoles,
            },
        });

        const roleMentions = selectedRoles.map(id => `<@&${id}>`).join(', ');
        await interaction.update({
            content: `✅ Cargos de recrutador atualizados para: ${roleMentions}.`,
            components: [],
        });
    },
};