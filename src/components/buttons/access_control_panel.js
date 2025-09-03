const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const prisma = require('../../prisma/client');
module.exports = {
    customId: 'access_control_panel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const modules = await prisma.moduleStatus.findMany({ where: { guildId: interaction.guild.id } });
        const embed = new EmbedBuilder().setColor('#E74C3C').setTitle('🔐 Painel de Controle de Acessos').setDescription('Selecione um módulo abaixo para gerenciar sua senha de acesso.');
        modules.forEach(m => {
            embed.addFields({ name: `${m.emoji} ${m.name}`, value: m.password ? '🔒 Protegido por Senha' : '✅ Acesso Livre', inline: true });
        });
        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId('access_select_module').setPlaceholder('Selecione um módulo...').addOptions(modules.map(m => ({ label: m.name, value: m.id })))
        );
        await interaction.editReply({ embeds: [embed], components: [selectMenu] });
    }
};