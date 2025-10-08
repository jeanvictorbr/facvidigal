// src/components/selects/registro_select_recrutador_role.js
module.exports = {
    customId: 'registro_select_recrutador_role',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const selectedRoles = interaction.values;

        // CORREÇÃO: Usando 'recrutadorRoleIds'
        await client.prisma.guildConfig.upsert({
            where: { guildId },
            update: {
                recrutadorRoleIds: selectedRoles,
            },
            create: {
                guildId,
                recrutadorRoleIds: selectedRoles,
            },
        });

        const roleMentions = selectedRoles.map(id => `<@&${id}>`).join(', ');
        await interaction.update({
            content: `✅ Cargos de recrutador atualizados para: ${roleMentions}.`,
            components: [],
        });
    },
};