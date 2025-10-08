// start.js
const { exec } = require('child_process');
const path = require('path');

console.log('[SISTEMA] Iniciando sincronização do banco de dados...');

const prismaPath = path.join(__dirname, 'node_modules', '.bin', 'prisma');

// --- PONTO DA MUDANÇA ---
// Trocamos 'migrate deploy' por 'db push'.
// AVISO: Este comando não é recomendado para produção pois pode causar perda de dados sem aviso.
// Use por sua conta e risco.
const command = `${prismaPath} db push`;

const syncProcess = exec(command, (error, stdout, stderr) => {
    if (stdout && !stdout.includes('already in sync')) {
        console.log(`[PRISMA DB PUSH] ${stdout.toString().trim()}`);
    }
    if (stderr) {
        // O 'db push' às vezes usa stderr para mensagens informativas, então filtramos por erros reais
        if (stderr.toLowerCase().includes('error')) {
            console.error(`[PRISMA DB PUSH ERROR] ${stderr.toString().trim()}`);
        } else {
             console.log(`[PRISMA DB PUSH INFO] ${stderr.toString().trim()}`);
        }
    }
    if (error) {
         console.error(`[SISTEMA] Falha crítica na sincronização do banco de dados (código: ${error.code}). O bot não será iniciado.`);
         process.exit(1);
    }
});


syncProcess.on('close', (code) => {
    if (code === 0) {
        console.log('[SISTEMA] Banco de dados está sincronizado. Iniciando o bot...');
        require('./src/index.js');
    } else {
        // A mensagem de erro já foi exibida pelo listener do 'exec'
        console.error(`[SISTEMA] Processo de sincronização encerrado com erros. O bot não será iniciado.`);
        process.exit(1); // Encerra a aplicação com um código de erro.
    }
});