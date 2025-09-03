// src/components/buttons/registro_approve.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_approve',
    async execute(interaction) {
        await interaction.deferUpdate();
        const applicationId = interaction.customId.split('_').pop();
        
        try {
            const originalMessage = interaction.message;
            const originalEmbed = originalMessage.embeds[0];
            const application = await prisma.application.findUnique({ where: { id: applicationId } });

            const PENDING_STATUSES = ['PENDING', 'PENDING_APPROVAL'];
            if (!application || !PENDING_STATUSES.includes(application.status)) {
                const finishedEmbed = new EmbedBuilder(originalEmbed).setColor('Grey').setDescription('Este registro já foi processado anteriormente ou cancelado.');
                await originalMessage.edit({ embeds: [finishedEmbed], components: [] });
                return;
            }

            const disabledButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('approve_disabled').setLabel('Processando...').setStyle(ButtonStyle.Secondary).setDisabled(true));
            await originalMessage.edit({ components: [disabledButtons] });

            const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guild.id } });
            const member = await interaction.guild.members.fetch(application.userId).catch(() => null);

            if (!member) {
                await prisma.application.update({ where: { id: applicationId }, data: { status: 'CANCELLED' } });
                const cancelledEmbed = new EmbedBuilder(originalEmbed).setColor('DarkRed').setDescription(`Registro cancelado: O usuário <@${application.userId}> não está mais no servidor.`);
                await originalMessage.edit({ embeds: [cancelledEmbed], components: [] });
                return;
            }

            const membroRole = config?.membroRoleId ? await interaction.guild.roles.fetch(config.membroRoleId).catch(() => null) : null;
            if (!membroRole) {
                await interaction.followUp({ content: '❌ O cargo de "Membro" não foi configurado ou não foi encontrado.', ephemeral: true });
                await originalMessage.edit({ components: originalMessage.components });
                return;
            }

            const newNickname = `${config.approvedTag || ''} ${application.rpName} | ${application.gameId}`.trim();
            await member.setNickname(newNickname);
            await member.roles.add(membroRole);

            await prisma.application.update({
                where: { id: applicationId },
                data: { status: 'APPROVED' } // Mantém o recrutadorId original
            });

            const recrutador = application.recrutadorId ? await interaction.guild.members.fetch(application.recrutadorId).catch(() => null) : null;
            if (recrutador) {
                await recrutador.send(`✅ O registro de **${application.rpName}** que você indicou foi aprovado por ${interaction.user.tag}.`).catch(() => {});
            }

            await member.send(`🎉 Parabéns! Seu registro no servidor **${interaction.guild.name}** foi aprovado por ${interaction.user}!`).catch(() => {});
            
            // ===================================================================
            // CORREÇÃO APLICADA AQUI
            // A imagem da embed original agora é mantida na embed final.
            // ===================================================================
            const approvedEmbed = new EmbedBuilder(originalEmbed)
                .setColor('Green')
                .setDescription(`**✅ REGISTRO APROVADO** por ${interaction.user}\n\nO membro <@${application.userId}> agora tem acesso liberado.`)
                .setImage('https://i.imgur.com/b0dyTcp.gif')
                
            await originalMessage.edit({ embeds: [approvedEmbed], components: [] });

        } catch (error) {
            console.error("Erro ao aprovar registro:", error);
            await interaction.followUp({ content: '❌ Ocorreu um erro crítico ao tentar aprovar este registro.', ephemeral: true });
        }
    }
};