import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// CORS headers helper
function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const { value } = req.body;

  if (!value) {
    return res.status(400).json({
      error: "Missing value",
    });
  }

  if(value.split(":").length !== 2) {
    return res.status(400).json({
      error: "Invalid value format. Expected 'name:score'",
    });
  }

  const leaderboard = await redis.lrange("368-leaderboard", 0, -1);
  const processedLeaderboard = leaderboard.map(entry => {
    const [name, score] = entry.split(":");
    return { name, score: parseInt(score) };
  });

  const newScore = parseInt(value.split(":")[1]);
  const newName = value.split(":")[0];

  // Insert in sorted order (ascending score)
  const insertAt = processedLeaderboard.findIndex(e => e.score > newScore);
  if (insertAt === -1) {
    processedLeaderboard.push({ name: newName, score: newScore });
  } else {
    processedLeaderboard.splice(insertAt, 0, { name: newName, score: newScore });
  }

  // Keep top 10
  if (processedLeaderboard.length > 10) {
    processedLeaderboard.splice(10);
  }

  const newLeaderboard = processedLeaderboard.map(e => `${e.name}:${e.score}`);
  await redis.del("368-leaderboard");
  await redis.rpush("368-leaderboard", ...newLeaderboard);

  res.json({
    success: true,
  });
}