const express = require("express");
const { createClient } = require("redis");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisHost = process.env.REDIS_HOST || "localhost";
const redisClient = createClient({
  url: `redis://${redisHost}:6379`,
});

redisClient.on("error", (err) => {
  console.error("Erro no cliente Redis:", err.message);
});

redisClient.connect().catch((err) => {
  console.error("Falha ao conectar inicialmente ao Redis:", err.message);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/pedido", async (req, res) => {
  try {
    const { cliente, cafe } = req.body;
    const pedidoId = Date.now();
    const timestamp = new Date().toLocaleTimeString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    // Força um timeout de 2 segundos caso o Redis esteja offline
    await comTimeout(
      redisClient.set(
        `pedido:${pedidoId}`,
        JSON.stringify({ cliente, cafe, timestamp }),
      ),
      2000,
    );

    res.json({
      success: true,
      message: `Pedido de ${cliente} (${cafe}) adicionado à fila com sucesso! ☕`,
    });
  } catch (err) {
    console.error("Erro de conexão com o Redis:", err.message);
    res.status(500).json({
      success: false,
      message: "Erro: A fila de pedidos (Redis) está offline!",
    });
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const keys = await comTimeout(redisClient.keys("pedido:*"), 2000);
    const pedidos = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      pedidos.push({ id: key, ...JSON.parse(data) });
    }

    res.json(pedidos);
  } catch (err) {
    console.error("Erro ao buscar no Redis:", err.message);
    res
      .status(500)
      .json({ error: "Erro: Não foi possível conectar ao Redis." });
  }
});

app.listen(3000, () => {
  console.log("Cafeteria app rodando na porta 3000");
});

// Função auxiliar de timeout
const comTimeout = (promessa, tempoMs = 2000) => {
  return Promise.race([
    promessa,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout: Redis demorou muito para responder")),
        tempoMs,
      ),
    ),
  ]);
};
