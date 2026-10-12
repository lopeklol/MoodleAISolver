# Moodle AI Solver

<p align="center">
  <img src="icon128.png" alt="Quick Notepad Logo" width="128" height="128">
</p>

<p align="center">
  <b>A lightweight, highly stealthy Moodle quiz solver disguised as a simple browser notepad.</b><br>
  Features advanced anti-detection mechanisms, customizable panic protocols, and multi-AI provider support.
</p>

---

## Features

* **Stealth Cover Identity:** Masquerades as a harmless "Quick Notepad" extension. The extension popup functions as a real, working local scratchpad until unlocked via a triple-click.
* **Multi-Provider AI Support:** Seamlessly integrates with **OpenAI (ChatGPT)**, **Google Gemini**, and **Groq (Llama)** with dynamic model fetching.
* **Intelligent Auto-Answering:** Automatically parses Moodle quiz questions and options, evaluates them via AI, and can either **auto-click** the correct answer or wait for an `Enter` keystroke.
* **Uncertainty Fallback ("0" State):** If the AI is unsure about a question, it returns `0` and turns the status indicator **blue**, allowing you to distinguish between technical errors and AI hesitation.
* **Emergency Self-Destruct / Panic Protocol:** Instantly removes all DOM indicators, clears the console, and executes a clean exit routine.
* **1:1 Authentic Log Spoofing:** Overwrites the console on exit with a genuine, native Moodle system log (`first.js:1083: Starting Moodle session keep-alive.`) so any casual observer sees only routine background keep-alives instead of traces of a solver.
* **Configurable Panic Shortcuts:** Supports custom keys (`F4`, `F12`, `Esc`, `X`, `Q`) paired with all combinatory modifier keys (`Ctrl`, `Alt`, `Shift`, and combinations thereof).
* **Strict Domain Isolation:** Operates **exclusively** on active Moodle quiz pages; stays entirely dormant and invisible on any other tabs.
* **Built-in Debug Mode:** Toggleable debug logging in the secret configuration panel for full developer visibility.

---

## How to Install

1. Clone the repository or download it as a ZIP:
```bash
git clone https://github.com/lopeklol/MoodleAISolver.git
```

2. Open your browser and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click **Load unpacked** in the top left and select the project folder containing your extension files.

---

## How to Configure

1. Click the extension icon on your browser toolbar to open the **Quick Notepad**.
2. **Unlock the Secret Panel:** Triple-click (`3x`) the title (`Quick Notepad`) to reveal the hidden Moodle Solver configuration panel.
3. Select your preferred AI **Provider** (OpenAI, Gemini, or Groq).
4. Paste your **API Key** and click the refresh button (`🔄`) to load and select your desired AI model.
5. Customize your settings (Auto-Click, Indicator visibility, Debug mode, and custom Self-Destruct panic keybinds).
6. Click **Zapisz ustawienia (Save settings)**.

---

## How to Use

1. Navigate to your Moodle quiz page. (The script remains completely idle on non-quiz pages).
2. If the status indicator dot is enabled, it will automatically cycle through states:
* 🟡 **Orange:** Processing query through AI.
* 🟢 **Green:** Answer found and selected (Sure).
* 🔵 **Blue:** AI is uncertain (Returned `0`).
* 🔴 **Red:** Technical or API error.


3. If **Auto-Click** is disabled, press `Enter` to confirm and trigger the selected option.
4. **Emergency Panic:** Press your configured panic shortcut combination at any time to instantly wipe traces and restore the native console session log.

---

> [!WARNING]
> Use responsibly. This tool was built for educational and experimental testing on private environments.

> [!NOTE]
> I know the code probably sucks, but it works, and I honestly don't care. Enjoy!
