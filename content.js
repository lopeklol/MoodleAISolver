async function getSettings() {
    return new Promise((resolve) => {
        try {
            if (!chrome.runtime?.id) {
                resolve({});
                return;
            }
            chrome.storage.sync.get(
                ["API_KEY", "extraInstructions", "provider", "selectedModel", "hideIndicator", "autoClick", "debugMode", "panicModifier", "panicKey"],
                (res) => {
                    if (chrome.runtime.lastError) {
                        resolve({});
                    } else {
                        resolve(res || {});
                    }
                }
            );
        } catch (e) {
            resolve({});
        }
    });
}

let isDestroyed = false;

function selfDestruct(debug) {
    if (isDestroyed) return;
    isDestroyed = true;

    const indicator = document.getElementById("moodle-solver-indicator");
    if (indicator) indicator.remove();

    
    if (debug) {
        console.clear();
        console.log("%c[Moodle Solver] Self-destruct executed. All traces removed.", "color: red; font-weight: bold;");
        
        if (typeof systemLog === "function") {
            systemLog();
        } else {
            console.log("Starting Moodle session keep-alive.");
        }
    }
}

async function getSettings() {
    return new Promise((resolve) => {
        try {
            if (!chrome.runtime?.id) {
                resolve({});
                return;
            }
            chrome.storage.sync.get(
                ["API_KEY", "extraInstructions", "provider", "selectedModel", "hideIndicator", "autoClick", "debugMode", "panicModifier", "panicKey"],
                (res) => {
                    if (chrome.runtime.lastError) {
                        resolve({});
                    } else {
                        resolve(res || {});
                    }
                }
            );
        } catch (e) {
            resolve({});
        }
    });
}

function selfDestruct(debug) {
    if (isDestroyed) return;
    isDestroyed = true;

    const indicator = document.getElementById("moodle-solver-indicator");
    if (indicator) indicator.remove();
    
    if (debug) {
        console.clear();
        console.log("%c[Moodle Solver] Self-destruct executed. All traces removed.", "color: red; font-weight: bold;");
        
        if (typeof systemLog === "function") {
            systemLog();
        } else {
            console.log("Starting Moodle session keep-alive.");
        }
    }
}

getSettings().then(settings => {
    const DEBUG = settings.debugMode === true;
    const pMod = settings.panicModifier || "none";
    const pKey = settings.panicKey || "F4";

    if (DEBUG) console.log("[Moodle Solver] Initialized. Panic shortcut set to:", pMod, "+", pKey);

    document.addEventListener("keydown", e => {
        let modifierMatch = true;

        if (pMod === "ctrl") modifierMatch = e.ctrlKey && !e.shiftKey && !e.altKey;
        else if (pMod === "alt") modifierMatch = !e.ctrlKey && !e.shiftKey && e.altKey;
        else if (pMod === "shift") modifierMatch = !e.ctrlKey && e.shiftKey && !e.altKey;
        else if (pMod === "ctrl+alt") modifierMatch = e.ctrlKey && !e.shiftKey && e.altKey;
        else if (pMod === "ctrl+shift") modifierMatch = e.ctrlKey && e.shiftKey && !e.altKey;
        else if (pMod === "alt+shift") modifierMatch = !e.ctrlKey && e.shiftKey && e.altKey;
        else if (pMod === "ctrl+alt+shift") modifierMatch = e.ctrlKey && e.shiftKey && e.altKey;
        else if (pMod === "none") modifierMatch = !e.ctrlKey && !e.shiftKey && !e.altKey;

        const keyMatch = (e.code === pKey || e.key === pKey || e.key.toUpperCase() === pKey.toUpperCase());

        if (modifierMatch && keyMatch) {
            e.preventDefault();
            if (DEBUG) console.log("[Moodle Solver] Panic shortcut triggered!");
            selfDestruct(DEBUG);
        }
    });
});

async function init() {
    const settings = await getSettings();
    const DEBUG = settings.debugMode === true;

    if (isDestroyed || !settings.API_KEY) return;

    const answers = [...document.querySelectorAll('[id]')]
        .filter(e => /^q\d+:\d+_answer\d+$/.test(e.id));
    const questionParagraph = document.querySelector('.qtext');

    if (answers.length === 0 || !questionParagraph) {
        if (DEBUG) console.log("[Moodle Solver] Not a Moodle quiz page. Staying idle.");
        return;
    }

    if (DEBUG) console.log("[Moodle Solver] Moodle quiz detected! Found answers:", answers.length);

    let statusIndicator = null;
    if (!settings.hideIndicator) {
        statusIndicator = document.createElement("div");
        statusIndicator.id = "moodle-solver-indicator";
        statusIndicator.style.position = "fixed";
        statusIndicator.style.bottom = "15px";
        statusIndicator.style.right = "15px";
        statusIndicator.style.width = "10px";
        statusIndicator.style.height = "10px";
        statusIndicator.style.borderRadius = "50%";
        statusIndicator.style.backgroundColor = "#777";
        statusIndicator.style.zIndex = "999999";
        statusIndicator.style.boxShadow = "0 0 6px rgba(0,0,0,0.5)";
        statusIndicator.style.transition = "background-color 0.3s ease";
        statusIndicator.style.cursor = "pointer";
        statusIndicator.title = "Moodle Solver: Bezczynny";
        
        statusIndicator.addEventListener("click", () => statusIndicator.remove());
        document.body.appendChild(statusIndicator);
    }

    function setStatus(state) {
        if (!statusIndicator || isDestroyed) return;
        switch (state) {
            case "loading":
                statusIndicator.style.backgroundColor = "#f39c12";
                statusIndicator.title = "Moodle Solver: Przetwarzanie...";
                break;
            case "ready":
                statusIndicator.style.backgroundColor = "#2ecc71";
                statusIndicator.title = "Moodle Solver: Gotowe (Pewne)";
                break;
            case "uncertain":
                statusIndicator.style.backgroundColor = "#3498db";
                statusIndicator.title = "Moodle Solver: AI niepewne (Zwrócono 0)";
                break;
            case "error":
                statusIndicator.style.backgroundColor = "#e74c3c";
                statusIndicator.title = "Moodle Solver: Błąd techniczny!";
                break;
            default:
                statusIndicator.style.backgroundColor = "#777";
        }
    }

    async function askAI(prompt, systemPrompt = "") {
        setStatus("loading");
        if (DEBUG) console.log("[Moodle Solver] Sending request to provider:", settings.provider, "Model:", settings.selectedModel);
        
        try {
            let resData = "";
            if (settings.provider === "gemini") {
                const modelToUse = settings.selectedModel || "gemini-2.0-flash";
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${settings.API_KEY}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }] })
                    }
                );
                const data = await res.json();
                if (DEBUG) console.log("[Moodle Solver] Gemini raw response:", data);
                resData = data.candidates[0].content.parts[0].text.trim();

            } else if (settings.provider === "groq") {
                const modelToUse = settings.selectedModel || "llama-3.1-8b-instant";
                const res = await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${settings.API_KEY.trim()}`
                        },
                        body: JSON.stringify({
                            model: modelToUse,
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: prompt }
                            ],
                            max_tokens: 1000,
                            temperature: 0.5
                        })
                    }
                );
                const data = await res.json();
                if (DEBUG) console.log("[Moodle Solver] Groq raw response:", data);
                resData = data.choices[0].message.content.trim();

            } else {
                const modelToUse = settings.selectedModel || "gpt-3.5-turbo";
                const res = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${settings.API_KEY.trim()}`
                    },
                    body: JSON.stringify({
                        model: modelToUse,
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: prompt }
                        ],
                        max_tokens: 1000,
                        temperature: 0.5
                    })
                });
                const data = await res.json();
                if (DEBUG) console.log("[Moodle Solver] OpenAI raw response:", data);
                resData = data.choices[0].message.content.trim();
            }

            if (DEBUG) console.log("[Moodle Solver] Parsed AI answer:", resData);
            return resData;
        } catch (err) {
            if (DEBUG) console.error("[Moodle Solver] AI Request Error:", err);
            setStatus("error");
            return null;
        }
    }

    const parents = [...document.querySelectorAll('[id]')]
        .filter(e => /^q\d+:\d+_answer\d+_label$/.test(e.id));

    if (parents.length > 0) {
        const answersTexts = parents.flatMap(p => [...p.querySelectorAll("div > p")]).map(p => p.textContent.trim());
        const questionText = questionParagraph.textContent.trim();
        const ansString = answersTexts.map((ans, i) => `Answer ${i + 1}: ${ans}`).join('\n');

        if (DEBUG) console.log("[Moodle Solver] Question text:", questionText);
        if (DEBUG) console.log("[Moodle Solver] Answers parsed:", answersTexts);

        const prompt = `You are an automated assistant taking a quiz. Choose the best matching answer.\n\n${settings.extraInstructions}\n\nQuestion:\n${questionText}\n\n${ansString}`;

        let correctAnswer = await askAI(prompt, "Respond ONLY with a single digit: 1, 2, 3, or 4 if you know the answer. If you are completely unsure, respond ONLY with 0. Do not write anything else.");

        if (!correctAnswer) {
            setStatus("error");
            return;
        }

        correctAnswer = correctAnswer.trim();

        if (correctAnswer === "0") {
            if (DEBUG) console.log("[Moodle Solver] AI returned 0 (Uncertain). Skipping click.");
            setStatus("uncertain");
            return;
        }

        if (/^[1-4]$/.test(correctAnswer)) {
            setStatus("ready");
            const index = parseInt(correctAnswer) - 1;

            if (!isNaN(index) && answers[index]) {
                if (DEBUG) console.log("[Moodle Solver] Selecting answer index:", index, "(Option", correctAnswer, ")");
                if (settings.autoClick) {
                    answers[index].click();
                    if (DEBUG) console.log("[Moodle Solver] Auto-clicked answer successfully.");
                } else {
                    const enterHandler = e => {
                        if (isDestroyed) return;
                        if (e.key === "Enter") {
                            if (DEBUG) console.log("[Moodle Solver] Enter pressed. Clicking answer.");
                            answers[index].click();
                        }
                    };
                    document.addEventListener("keydown", enterHandler);
                }
            }
        } else {
            if (DEBUG) console.warn("[Moodle Solver] AI returned invalid format:", correctAnswer);
            setStatus("error");
        }
    }
}

setTimeout(() => {
    init();
}, 0);