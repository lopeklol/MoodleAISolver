const coverTitle = document.getElementById("coverTitle");
const coverContent = document.getElementById("coverContent");
const secretPanel = document.getElementById("secretPanel");
const noteInput = document.getElementById("noteInput");
const noteStatus = document.getElementById("noteStatus");

let clickCount = 0;
let clickTimer = null;

coverTitle.addEventListener("click", () => {
    clickCount++;
    if (clickCount === 3) {
        secretPanel.style.display = "flex";
        coverContent.style.display = "none";
        coverTitle.textContent = "⚙️ Moodle Solver Panel";
        coverTitle.style.color = "#dcdcaa";
        clickCount = 0;
    }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);
});

chrome.storage.local.get(["userNote"], (res) => {
    if (res.userNote) noteInput.value = res.userNote;
});

noteInput.addEventListener("input", () => {
    chrome.storage.local.set({ userNote: noteInput.value });
    noteStatus.textContent = "Zapisano zmiany...";
    setTimeout(() => { noteStatus.textContent = "Zapisano lokalnie"; }, 1000);
});

const apiKeyInput = document.getElementById("apiKey");
const moreInput = document.getElementById("more");
const saveBtn = document.getElementById("save");
const fetchModelsBtn = document.getElementById("fetchModels");
const outputSpan = document.getElementById("output");
const providerSelect = document.getElementById("provider");
const modelSelect = document.getElementById("modelSelect");
const hideIndicatorCheckbox = document.getElementById("hideIndicator");
const autoClickCheckbox = document.getElementById("autoClick");
const debugModeCheckbox = document.getElementById("debugMode");
const panicModifierSelect = document.getElementById("panicModifier");
const panicKeySelect = document.getElementById("panicKey");

let realKey = "";

async function loadModelsForProvider(provider, apiKey, selectedModel = "") {
    modelSelect.innerHTML = '<option value="">Ładowanie modeli...</option>';
    let models = [];
    try {
        if (provider === "openai") {
            const res = await fetch("https://api.openai.com/v1/models", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const data = await res.json();
            if (data.data) models = data.data.filter(m => m.id.includes("gpt")).map(m => m.id).sort();
        } else if (provider === "groq") {
            const res = await fetch("https://api.groq.com/openai/v1/models", {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const data = await res.json();
            if (data.data) models = data.data.map(m => m.id);
        } else if (provider === "gemini") {
            models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];
        }

        modelSelect.innerHTML = "";
        if (models.length === 0) {
            modelSelect.innerHTML = '<option value="">Brak modeli</option>';
            return;
        }
        models.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m;
            opt.textContent = m;
            if (m === selectedModel) opt.selected = true;
            modelSelect.appendChild(opt);
        });
    } catch (e) {
        modelSelect.innerHTML = '<option value="">Błąd pobierania</option>';
    }
}

if (apiKeyInput && saveBtn) {
    chrome.storage.sync.get(["API_KEY", "extraInstructions", "provider", "selectedModel", "hideIndicator", "autoClick", "debugMode", "panicModifier", "panicKey"], (res) => {
        if (res.API_KEY) {
            realKey = res.API_KEY;
            apiKeyInput.value = "•".repeat(Math.min(realKey.length, 20));
        } else {
            apiKeyInput.value = "";
        }
        if (res.extraInstructions) moreInput.value = res.extraInstructions;
        if (res.provider) providerSelect.value = res.provider;
        if (res.hideIndicator !== undefined) hideIndicatorCheckbox.checked = res.hideIndicator;
        if (res.autoClick !== undefined) autoClickCheckbox.checked = res.autoClick;
        if (res.debugMode !== undefined) debugModeCheckbox.checked = res.debugMode;
        if (res.panicModifier) panicModifierSelect.value = res.panicModifier;
        if (res.panicKey) panicKeySelect.value = res.panicKey;

        if (res.API_KEY) {
            loadModelsForProvider(res.provider || "openai", res.API_KEY, res.selectedModel);
        }
    });

    providerSelect.addEventListener("change", () => {
        if (realKey) loadModelsForProvider(providerSelect.value, realKey);
    });

    fetchModelsBtn.addEventListener("click", () => {
        const entered = apiKeyInput.value.trim();
        const currentKey = entered.includes("•") ? realKey : entered;
        if (!currentKey) {
            outputSpan.textContent = "Najpierw wpisz klucz!";
            return;
        }
        loadModelsForProvider(providerSelect.value, currentKey);
        outputSpan.textContent = "Pobrano modele!";
    });

    saveBtn.addEventListener("click", () => {
        const entered = apiKeyInput.value.trim();
        const API_KEY = entered.includes("•") ? realKey : entered;
        const extraInstructions = moreInput ? moreInput.value.trim() : "";
        const provider = providerSelect ? providerSelect.value : "openai";
        const selectedModel = modelSelect ? modelSelect.value : "";
        const hideIndicator = hideIndicatorCheckbox ? hideIndicatorCheckbox.checked : false;
        const autoClick = autoClickCheckbox ? autoClickCheckbox.checked : false;
        const debugMode = debugModeCheckbox ? debugModeCheckbox.checked : false;
        const panicModifier = panicModifierSelect ? panicModifierSelect.value : "none";
        const panicKey = panicKeySelect ? panicKeySelect.value : "F4";

        chrome.storage.sync.set({ API_KEY, extraInstructions, provider, selectedModel, hideIndicator, autoClick, debugMode, panicModifier, panicKey }, () => {
            realKey = API_KEY;
            apiKeyInput.value = API_KEY ? "•".repeat(Math.min(API_KEY.length, 20)) : "";
            if (outputSpan) outputSpan.textContent = "Zapisano!";
        });
    });
}