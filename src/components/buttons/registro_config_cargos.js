// src/components/buttons/registro_config_cargos.js
const { EmbedBuilder, ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_config_cargos',
    async execute(interaction) {
        await interaction.deferUpdate();

        const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guild.id } });
        
        // --- LÓGICA ATUALIZADA PARA LISTA DE CARGOS ---
        const recruiterRoles = config?.recrutadorRoleIds || [];
        const recruiterRolesText = recruiterRoles.length > 0
            ? recruiterRoles.map(id => `> <@&${id}>`).join('\n')
            : '`[ ✖️ NENHUM CARGO DEFINIDO ]`';

        const memberRole = config?.membroRoleId ? `<@&${config.membroRoleId}>` : '`[ ✖️ NÃO DEFINIDO ]`';

        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('[ 🎖️ CONFIGURAÇÃO DE CARGOS DE REGISTRO ]')
            .setDescription('Defina os cargos essenciais para o fluxo de registro.')
            .setThumbnail('https://media.discordapp.net/attachments/1310610658844475404/1401110522228637786/standard_7.gif?ex=688f155b&is=688dc3db&hm=d90a54a81a18f9e53438b05d9b2c2f0b42028c1c6e5dc6dbcfd4afaeca55ca9e&=')
            .addFields(
                { name: '🛡️ Cargos de Recrutador', value: recruiterRolesText, inline: false },
                { name: '✅ Cargo de Membro Registrado', value: `> ${memberRole}`, inline: false }
            )
            .setFooter({ text: 'As alterações são salvas automaticamente após a seleção.' });

        // --- MENU ATUALIZADO PARA MÚLTIPLA SELEÇÃO ---
        const recruiterRoleMenu = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('registro_select_recrutador_roles') // Aponta para o novo handler
                .setPlaceholder('SELECIONE OS CARGOS DE RECRUTADOR')
                .setMinValues(0) // Permite selecionar "nenhum" para limpar a lista
                .setMaxValues(10) // Permite selecionar até 10 cargos
        );

        const memberRoleMenu = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('registro_select_membro_role')
                .setPlaceholder('SELECIONE O CARGO DE MEMBRO')
        );
        
        const backButtonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('view_module_registro')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        await interaction.editReply({ embeds: [embed], components: [recruiterRoleMenu, memberRoleMenu, backButtonRow] });
    }
};