// src/components/selects/registro_select_membro_role.js
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_membro_role',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const selectedRole = interaction.values[0];

        // CORREÇÃO: Usando 'guildConfig' e o campo 'registroMembroRoleId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { registroMembroRoleId: selectedRole },
            create: {
                guildId,
                registroMembroRoleId: selectedRole,
            },
        });

        await interaction.update({
            content: `✅ Cargo de membro definido como <@&${selectedRole}>.`,
            components: [],
        });
    },
};