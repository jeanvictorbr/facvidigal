// api.js - Coloque este arquivo junto com o arquivo principal do seu bot
const express = require('express');
const cors = require('cors');

function startApi(client) { // 'client' é o seu cliente do Discord.js
  const app = express();
  const port = 8080; // Porta padrão da Discloud

  app.use(cors()); // Habilita o CORS para que seu site Vercel possa acessar
  app.use(express.json());

  app.get('/api/server-stats', async (req, res) => {
    try {
      const guildId = '1302492815409938514'; // <-- COLOQUE O ID DO SEU SERVIDOR AQUI
      const guild = await client.guilds.fetch(guildId);
      if (!guild) {
        return res.status(404).json({ error: 'Servidor não encontrado.' });
      }

      await guild.members.fetch(); // Busca todos os membros para garantir a contagem correta

      const onlineMembers = guild.members.cache.filter(
        (member) => !member.user.bot && member.presence?.status !== 'offline'
      ).size;

      res.json({ onlineCount: onlineMembers });
    } catch (error) {
      console.error('Erro ao buscar stats do servidor:', error);
      res.status(500).json({ error: 'Erro interno do servidor.' });
    }
  });

  app.listen(port, () => {
    console.log(`[API JV STORE] Servidor de API rodando na porta ${port}`);
  });
}

module.exports = startApi;