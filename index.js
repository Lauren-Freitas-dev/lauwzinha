require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true
});
async function conectarDB() {
  try {
    await client.connect();
    db = client.db("lauwzinha");
    console.log("✅ Conectado ao MongoDB com sucesso!");
  } catch (error) {
    console.error("❌ Erro crítico no MongoDB:", error);
    process.exit(1);
}
    console.error("❌ Erro ao conectar no MongoDB:", error);
  }

app.get('/', (req, res) => {
    res.send('Servidor da Lauwzinha rodando!');
});

// GET mensagens
app.get('/mensagens', async (req, res) => {
    try {
        const mensagens = await db.collection('mensagens').find().sort({data: -1}).toArray();
        res.json(mensagens);
    } catch (e) {
        res.status(500).send("Erro ao buscar mensagens");
    }
});

// POST mensagens
app.post('/mensagens', async (req, res) => {
    try {
        const { mensagem, nome } = req.body;
        const ip = req.ip;

        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

        const jaEnviou = await db.collection('mensagens').findOne({
            ip: ip,
            data: { $gt: umaSemanaAtras }
        });

        if (jaEnviou) {
            return res.send('Você já enviou uma mensagem essa semana! Volte em breve 💗');
        }

        await db.collection('mensagens').insertOne({
            ip,
            nome,
            texto: mensagem,
            data: new Date()
        });

        res.send('Mensagem recebida!');
    } catch (e) {
        res.status(500).send("Erro ao salvar mensagem");
    }
});

app.get('/desenhos', async (req, res) => {
    try {
        const desenhos = await db.collection('desenhos').find().toArray();
        res.json(desenhos);
    } catch (e) {
        res.status(500).send("Erro ao buscar desenhos");
    }
});

app.post('/desenhos', async (req, res) => {
    try {
        const { imagem } = req.body;

        await db.collection('desenhos').insertOne({
            imagem: imagem,
            data: new Date()
        });

        res.send('Desenho enviado com sucesso! 🎨');
    } catch (e) {
        res.status(500).send("Erro ao salvar desenho");
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
}); 

conectarDB().catch(err => console.error("Erro ao conectar no banco:", err));
