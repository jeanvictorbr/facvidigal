// src/events/guildMemberUpdate.js
const { Events } = require('discord.js');
const prisma = require('../prisma/client');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Roda apenas se houver mudança de cargos
        if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

        // --- LÓGICA 1: ATUALIZADOR DE HIERARQUIA ---
        try {
            const { updateHierarchyEmbed } = require('../components/buttons/hierarquia_action_publish.js');
            await updateHierarchyEmbed(newMember.guild);
        } catch (error) {
            console.error(`[HIERARQUIA] Falha ao atualizar embed via GuildMemberUpdate:`, error);
        }

        // --- LÓGICA 2: GERENCIADOR DE TAGS AUTOMÁTICAS v2.0 ---
        try {
            const currentNickname = newMember.nickname || newMember.user.username;
            // Limpa qualquer tag antiga do apelido para começar do zero
            const nameWithoutTags = currentNickname.replace(/\[.*?\]\s*/g, '').trim();

            // Pega todos os cargos do membro que TÊM uma tag configurada no banco de dados
            const memberRolesWithTags = await prisma.roleTag.findMany({
                where: {
                    guildId: newMember.guild.id,
                    roleId: { in: newMember.roles.cache.map(r => r.id) }
                }
            });

            // Se o membro não tem mais nenhum cargo com tag, remove a tag do apelido
            if (memberRolesWithTags.length === 0) {
                if (currentNickname !== nameWithoutTags && newMember.manageable) {
                    await newMember.setNickname(nameWithoutTags);
                    console.log(`[TAGS] Todas as tags removidas de ${newMember.user.tag}.`);
                }
                return;
            }

            // Lógica de Prioridade: Encontra o cargo mais alto do membro que tem uma tag
            let highestRoleTag = null;
            let highestRolePosition = -1;

            for (const roleTag of memberRolesWithTags) {
                const role = newMember.roles.cache.get(roleTag.roleId);
                if (role && role.position > highestRolePosition) {
                    highestRolePosition = role.position;
                    highestRoleTag = roleTag;
                }
            }
            
            if (highestRoleTag) {
                // Limpa a tag para evitar brackets duplos: "[TAG]" -> "TAG"
                const cleanTag = highestRoleTag.tag.replace(/[\[\]]/g, '');
                const newNickname = `[${cleanTag}] ${nameWithoutTags}`;

                // Verifica se o bot pode gerenciar o apelido
                if (!newMember.manageable) {
                    console.warn(`[TAGS] AVISO: Não foi possível aplicar a tag '[${cleanTag}]' para ${newMember.user.tag}. O cargo do bot é mais baixo que o do membro.`);
                    return;
                }

                // Só altera o apelido se for diferente, para evitar ações desnecessárias
                if (currentNickname !== newNickname) {
                    // Verifica o limite de 32 caracteres do Discord
                    if (newNickname.length > 32) {
                        console.warn(`[TAGS] AVISO: O novo apelido "${newNickname}" excede 32 caracteres e não pode ser aplicado.`);
                        return;
                    }
                    await newMember.setNickname(newNickname);
                    console.log(`[TAGS] Tag '[${cleanTag}]' aplicada para ${newMember.user.tag} (cargo mais alto).`);
                }
            }

        } catch(error) {
            console.error(`[TAGS] Falha ao tentar aplicar/remover tag automática:`, error);
        }
    },
};