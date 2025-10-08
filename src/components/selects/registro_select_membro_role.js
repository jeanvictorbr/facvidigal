// src/components/selects/registro_select_membro_role.js
module.exports = {
    customId: 'registro_select_membro_role',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const selectedRole = interaction.values[0];

        // CORREÇÃO: Usando 'membroRoleId'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: { membroRoleId: selectedRole },
            create: {
                guildId,
                membroRoleId: selectedRole,
            },
        });

        await interaction.update({
            content: `✅ Cargo de membro definido como <@&${selectedRole}>.`,
            components: [],
        });
    },
};