const fetch = require("node-fetch");
const readline = require("readline");
const { translate } = require("@vitalets/google-translate-api");

async function traduzir(texto) {
  try {
    const result = await translate(texto, { to: "pt" });
    return result.text;
  } catch (err) {
    console.error("Erro ao traduzir:", err);
    return texto; // se falhar, retorna o texto original
  }
}

async function getQuestion() {
  try {
    const res = await fetch(
      "https://www.reddit.com/r/WouldYouRather/top.json?limit=100",
    );
    const data = await res.json();

    const posts = data.data.children;

    const valid = posts
      .map((p) => p.data)
      .filter((p) => !p.over_18 && p.title.toLowerCase().includes("or"))
      .map((p) => p.title);

    if (valid.length === 0) return null;

    const random = valid[Math.floor(Math.random() * valid.length)];

    return parseQuestion(random);
  } catch (err) {
    console.error("Erro ao buscar:", err);
    return null;
  }
}

function parseQuestion(title) {
  let cleaned = title
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

async function startGame() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🎮 Jogo: O que você prefere?\n");

  while (true) {
    let q = null;

    while (!q) {
      q = await getQuestion();
    }

    // traduz as opções
    const op1 = await traduzir(q.option1);
    const op2 = await traduzir(q.option2);

    console.log("\n👉 O que você prefere?\n");
    console.log("1 - " + op1);
    console.log("2 - " + op2);

    await new Promise((resolve) => {
      rl.question("\nEscolha (1/2) ou 'q' pra sair: ", (answer) => {
        if (answer.toLowerCase() === "q") {
          console.log("\n👋 Valeu por jogar!");
          process.exit();
        }

        if (answer !== "1" && answer !== "2") {
          console.log("❌ Escolha inválida!");
        } else {
          console.log("🔥 Boa escolha!");
        }

        resolve();
      });
    });
  }
}

startGame();
