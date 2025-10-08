// src/components/buttons/registro_config_cargos.js
const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'registro_config_cargos',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // CORREÇÃO: Usando os nomes de campo corretos do schema: 'membroRoleId' e 'recrutadorRoleIds'
        const config = await client.prisma.guildConfig.findUnique({
            where: { guildId },
            select: {
                membroRoleId: true,
                recrutadorRoleIds: true,
            },
        });

        const membroRoleSelect = new RoleSelectMenuBuilder()
            .setCustomId('registro_select_membro_role')
            .setPlaceholder('Selecione o cargo de membro')
            .setMaxValues(1);

        if (config?.membroRoleId) {
            membroRoleSelect.setDefaultRoles([config.membroRoleId]);
        }

        const recrutadorRoleSelect = new RoleSelectMenuBuilder()
            .setCustomId('registro_select_recrutador_role')
            .setPlaceholder('Selecione os cargos de recrutador')
            .setMinValues(1)
            .setMaxValues(10);

        if (config?.recrutadorRoleIds && config.recrutadorRoleIds.length > 0) {
            recrutadorRoleSelect.setDefaultRoles(config.recrutadorRoleIds);
        }

        await interaction.reply({
            content: 'Selecione os cargos abaixo:',
            components: [
                new ActionRowBuilder().addComponents(membroRoleSelect),
                new ActionRowBuilder().addComponents(recrutadorRoleSelect),
            ],
            ephemeral: true,
        });
    },
};