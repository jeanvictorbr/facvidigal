// src/components/modals/registro_modal_submit.js
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const prisma = require('../../prisma/client');

module.exports = {
    customId: 'registro_modal_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // CORREÇÃO: Usando os IDs corretos que o formulário envia
            const rpName = interaction.fields.getTextInputValue('reg_rp_name');
            const gameId = interaction.fields.getTextInputValue('reg_game_id');
            const userId = interaction.user.id;
            const guildId = interaction.guild.id;

            // O resto da lógica para salvar no banco e mostrar o menu de recrutadores
            // continua a mesma que já estava funcionando.
            // ...
            
            // Exemplo da continuação da lógica:
            const application = await prisma.application.create({
                data: { guildId, userId, rpName, gameId, status: 'PENDING' }
            });

            const config = await prisma.guildConfig.findUnique({ where: { guildId } });
            const recruiterRoleIds = config?.recrutadorRoleIds || [];
            if (recruiterRoleIds.length === 0) {
                return interaction.editReply('❌ Sistema de registro desativado. Nenhum cargo de recrutador configurado.');
            }

            await interaction.guild.members.fetch();
            const recruiters = interaction.guild.members.cache.filter(member => 
                !member.user.bot && member.roles.cache.some(role => recruiterRoleIds.includes(role.id))
            );

            if (recruiters.size === 0) {
                return interaction.editReply('❌ Nenhum recrutador disponível. Tente mais tarde.');
            }
            
            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`registro_select_recruiter_${application.id}`) 
                    .setPlaceholder('Selecione quem te recrutou...')
                    .addOptions(
                        recruiters.map(recruiter => ({
                            label: recruiter.displayName.substring(0, 100),
                            description: `ID: ${recruiter.id}`,
                            value: recruiter.id
                        }))
                    )
            );

            await interaction.editReply({
                content: `Ótimo, ${rpName}! Como último passo, selecione quem foi o seu recrutador.`,
                components: [selectMenu]
            });

        } catch (error) {
            console.error("Erro ao processar modal de registro:", error);
            await interaction.editReply('❌ Ocorreu um erro ao processar seu registro.');
        }
    }
};