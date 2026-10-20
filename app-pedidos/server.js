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

redisClient.connect().catch(console.error);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/pedido", async (req, res) => {
  try {
    const { cliente, cafe } = req.body;
    const pedidoId = Date.now();
    const timestamp = new Date().toLocaleTimeString();

    await redisClient.set(
      `pedido:${pedidoId}`,
      JSON.stringify({ cliente, cafe, timestamp }),
    );

    res.json({
      success: true,
      message: `Pedido de ${cliente} (${cafe}) adicionado à fila com sucesso! ☕`,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Erro ao registrar o pedido." });
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const keys = await redisClient.keys("pedido:*");
    const pedidos = [];

    for (const key of keys) {
      const data = await redisClient.get(key);
      pedidos.push({ id: key, ...JSON.parse(data) });
    }

    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pedidos." });
  }
});

app.listen(3000, () => {
  console.log("Cafeteria app rodando na porta 3000");
});
