const express = require("express");
const fetch = require("node-fetch");
const { translate } = require("@vitalets/google-translate-api");
const app = express();

async function traduzir(texto) {
  try {
    const result = await translate(texto, { to: "pt" });
    return result.text;
  } catch (err) {
    return texto;
  }
}

async function getQuestion() {
  const res = await fetch(
    "https://www.reddit.com/r/WouldYouRather/top.json?limit=100",
    { headers: { "User-Agent": "nodejs-game/1.0" } },
  );
  const data = await res.json();
  const posts = data.data.children;

  const valid = posts
    .map((p) => p.data)
    .filter((p) => !p.over_18 && p.title.toLowerCase().includes("or"))
    .map((p) => p.title);

  if (valid.length === 0) return null;

  const random = valid[Math.floor(Math.random() * valid.length)];
  let cleaned = random
    .replace(/would you rather/gi, "")
    .replace(/wyr/gi, "")
    .replace(/\?/g, "")
    .trim();

  const parts = cleaned.split(/ or /i);
  if (parts.length < 2) return null;

  return {
    option1: parts[0].trim(),
    option2: parts.slice(1).join(" or ").trim(),
  };
}

// rota que o Java vai chamar
app.get("/pergunta", async (req, res) => {
  try {
    let q = null;
    while (!q) q = await getQuestion();

    const op1 = await traduzir(q.option1);
    const op2 = await traduzir(q.option2);

    res.json({
      opcao1: op1,
      opcao2: op2,
    });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar pergunta" });
  }
});

app.listen(3000, () =>
  console.log("✅ Servidor rodando em http://localhost:3000"),
);
