// src/components/buttons/registro_config_cargos.js
const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'registro_config_cargos',
    async execute(interaction, client) {
        const guildId = interaction.guild.id;

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

        // --- MELHORIA DE TEXTO ---
        const replyContent = `
### ⚙️ Configuração de Cargos do Registro

**1. Cargo de Membro:**
*Use o **primeiro menu** para definir o cargo que novos membros aprovados receberão.*

**2. Cargos de Recrutador:**
*Use o **segundo menu** para definir quais cargos podem avaliar os registros.*
        `;

        await interaction.reply({
            content: replyContent,
            components: [
                new ActionRowBuilder().addComponents(membroRoleSelect),
                new ActionRowBuilder().addComponents(recrutadorRoleSelect),
            ],
            ephemeral: true,
        });
    },
};