// scripts/test-webhook.js
async function test() {
  const url = "https://nikunjn8n.up.railway.app/webhook/lexicon-compare";
  
  const payload = {
    blocksA: ["Role", "Context", "Format"],
    blocksB: ["Context"],
    promptA: "You are an expert prompt engineer. Analyze the following user feedback and extract key themes. Return a JSON object with 'themes' array.",
    promptB: "Analyze the following user feedback and extract key themes."
  };

  console.log("Sending POST request to:", url);
  console.log("Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log("\n✅ Webhook successful! Status:", response.status);
    try {
      const data = JSON.parse(text);
      console.log("Response JSON:", JSON.stringify(data, null, 2));
    } catch {
      console.log("Response text:", text);
    }
  } catch (error) {
    console.error("\n❌ Webhook failed:", error);
  }
}

test();
