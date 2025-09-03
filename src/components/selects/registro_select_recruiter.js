// src/components/selects/registro_select_recruiter.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_select_recruiter', // Será lido com startsWith
    async execute(interaction) {
        await interaction.deferUpdate();

        const applicationId = interaction.customId.split('_').pop();
        const recruiterId = interaction.values[0];

        try {
            const application = await prisma.application.update({
                where: { id: applicationId },
                data: {
                    recrutadorId: recruiterId,
                    status: 'PENDING_APPROVAL'
                }
            });

            const member = await interaction.guild.members.fetch(application.userId).catch(() => null);
            const recruiter = await interaction.guild.members.fetch(recruiterId).catch(() => null);
            const config = await prisma.guildConfig.findUnique({ where: { guildId: interaction.guild.id } });

            if (!member || !config?.logsChannelId) {
                return interaction.editReply({ content: '❌ Ocorreu um erro. O membro pode ter saído ou o canal de logs não está configurado.', components: [] });
            }

            const logsChannel = await interaction.guild.channels.fetch(config.logsChannelId).catch(() => null);
            if (!logsChannel) {
                return interaction.editReply({ content: '❌ O canal de logs de registro não foi encontrado.', components: [] });
            }

            const analysisEmbed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle(`Análise de Recrutamento: ${member.user.username}`)
                .setDescription('`Um novo registro foi concluído e aguarda sua análise.`')
                .setImage('https://i.imgur.com/b0dyTcp.gif')
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: '💻 Alvo', value: `${member}\n(\`${member.id}\`)`, inline: false },
                    { name: '👤 Nome RP', value: `\`${application.rpName}\``, inline: true },
                    { name: '🔗 ID Jogo', value: `\`${application.gameId}\``, inline: true },
                    // ===================================================================
                    // CORREÇÃO: A variável foi corrigida de "recruter" para "recruiter"
                    // ===================================================================
                    { name: '🛡️ Recrutador', value: `${recruiter || '`Não encontrado`'}`, inline: false }
                )
                .setFooter({ text: `ID da Aplicação: ${application.id}` })
                .setTimestamp();
            
            const actionButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`registro_approve_${application.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`registro_decline_${application.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger)
            );

            await logsChannel.send({ embeds: [analysisEmbed], components: [actionButtons] });

            await interaction.editReply({ content: '✅ Seu registro foi enviado para análise da staff! Aguarde que vc será notificado.', components: [] });

        } catch (error) {
            console.error("Erro ao finalizar registro (select recruiter):", error);
            await interaction.editReply({ content: '❌ Ocorreu um erro crítico ao finalizar seu registro.', components: [] });
        }
    }
};