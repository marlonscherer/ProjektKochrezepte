import process from "process";

export async function sendeOpenAIAnfrage({ systemPrompt, userPrompt }) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY fehlt. Bitte als Umgebungsvariable setzen.");
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-5.3-codex",
            input: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        })
    });

    if (!response.ok) {
        const fehlerText = await response.text();
        throw new Error(`OpenAI API Fehler: ${response.status} ${fehlerText}`);
    }

    return response.json();
}
