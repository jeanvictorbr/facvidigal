// src/components/buttons/registro_config_cargos.js
const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_config_cargos',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

        // CORREÇÃO: Lendo de 'guildConfig' e usando os nomes de campo corretos
        const config = await client.prisma.guildConfig.findUnique({
            where: { guildId },
            select: {
                registroMembroRoleId: true,
                recrutador_roles: true,
            },
        });

        const membroRoleSelect = new RoleSelectMenuBuilder()
            .setCustomId('registro_select_membro_role')
            .setPlaceholder('Selecione o cargo de membro')
            .setMaxValues(1);

        if (config?.registroMembroRoleId) {
            membroRoleSelect.setDefaultRoles([config.registroMembroRoleId]);
        }

        const recrutadorRoleSelect = new RoleSelectMenuBuilder()
            .setCustomId('registro_select_recrutador_role')
            .setPlaceholder('Selecione os cargos de recrutador')
            .setMinValues(1)
            .setMaxValues(10);

        if (config?.recrutador_roles && config.recrutador_roles.length > 0) {
            recrutadorRoleSelect.setDefaultRoles(config.recrutador_roles);
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