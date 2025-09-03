// src/components/buttons/recruiters_action_view_ranking.js
const { EmbedBuilder } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    // Certifique-se que o customId corresponde ao seu botão no painel
    customId: 'recruiters_action_view_ranking',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Consulta otimizada para agrupar e contar os registros por recrutador
            const rankingData = await prisma.application.groupBy({
                by: ['recrutadorId'],
                where: {
                    guildId: interaction.guild.id,
                    status: 'APPROVED',
                    recrutadorId: {
                        not: null // Garante que não contamos registros sem recrutador
                    }
                },
                _count: {
                    recrutadorId: true
                },
                orderBy: {
                    _count: {
                        recrutadorId: 'desc'
                    }
                },
                take: 10 // Pega o Top 10
            });

            const embed = new EmbedBuilder()
                .setColor('#1ABC9C')
                .setTitle('🏆 Ranking de Recrutadores')
                .setTimestamp();

            if (rankingData.length === 0) {
                embed.setDescription('Ainda não há registros de recrutamento aprovados para exibir.');
            } else {
                const rankingDescription = rankingData.map((recruiter, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const medal = medals[index] || `**${index + 1}.**`;
                    return `${medal} <@${recruiter.recrutadorId}> - **${recruiter._count.recrutadorId}** recrutamentos`;
                }).join('\n');
                embed.setDescription(rankingDescription);
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Erro ao gerar ranking:", error);
            await interaction.editReply('❌ Ocorreu um erro ao buscar os dados do ranking.');
        }
    }
};