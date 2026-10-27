(function () {
  // Model Rates per 1,000,000 Tokens (2026 Official API Pricing)
  const PRICING = {
    // OpenAI ChatGPT / Reasoning
    "gpt-5-nano": { name: "GPT-5 Nano", input: 0.05, output: 0.40 },
    "gpt-4o-mini": { name: "GPT-4o Mini", input: 0.15, output: 0.60 },
    "gpt-5.4-mini": { name: "GPT-5.4 Mini", input: 0.75, output: 4.50 },
    "o3-mini": { name: "o3-mini", input: 1.10, output: 4.40 },
    "gpt-4o": { name: "GPT-4o", input: 2.50, output: 10.00 },
    "o1": { name: "o1", input: 15.00, output: 60.00 },
    "gpt-4.5": { name: "GPT-4.5", input: 75.00, output: 150.00 },

    // Google Gemini
    "gemini-2.0-flash-lite": { name: "Gemini 2.0 Flash-Lite", input: 0.075, output: 0.30 },
    "gemini-2.0-flash": { name: "Gemini 2.0 Flash", input: 0.10, output: 0.40 },
    "gemini-1.5-pro": { name: "Gemini 1.5 Pro", input: 1.25, output: 5.00 },
    "gemini-2.5-pro": { name: "Gemini 2.5 Pro", input: 1.25, output: 10.00 },

    // Anthropic Claude
    "claude-3.5-haiku": { name: "Claude 3.5 Haiku", input: 0.80, output: 4.00 },
    "claude-3.5-sonnet": { name: "Claude 3.5 Sonnet", input: 3.00, output: 15.00 },
    "claude-3-opus": { name: "Claude 3 Opus", input: 15.00, output: 75.00 },

    // DeepSeek
    "deepseek-v3": { name: "DeepSeek V3", input: 0.14, output: 0.28 },
    "deepseek-r1": { name: "DeepSeek R1", input: 0.55, output: 2.19 },

    // Meta Llama
    "llama-3.3-70b": { name: "Llama 3.3 70B", input: 0.59, output: 0.79 },
    "llama-3.1-405b": { name: "Llama 3.1 405B", input: 3.50, output: 3.50 },

    // Mistral
    "mistral-small": { name: "Mistral Small", input: 0.20, output: 0.60 },
    "mistral-large": { name: "Mistral Large", input: 2.00, output: 6.00 }
  };

  const SCENARIOS = {
    chat: { system: 200, user: 20, output: 15, requests: 1000 },
    rag: { system: 2500, user: 80, output: 350, requests: 1000 },
    code: { system: 800, user: 400, output: 600, requests: 500 },
    extract: { system: 450, user: 150, output: 30, requests: 5000 }
  };

  // DOM Elements
  const modelSelect = document.getElementById('modelSelect');
  const systemTokensEl = document.getElementById('systemTokens');
  const userTokensEl = document.getElementById('userTokens');
  const outputTokensEl = document.getElementById('outputTokens');
  const dailyRequestsEl = document.getElementById('dailyRequests');

  const inputRateVal = document.getElementById('inputRateVal');
  const outputRateVal = document.getElementById('outputRateVal');

  const calcTotalInputTokens = document.getElementById('calcTotalInputTokens');
  const calcOutputTokens = document.getElementById('calcOutputTokens');
  const calcInputFormula = document.getElementById('calcInputFormula');
  const calcOutputFormula = document.getElementById('calcOutputFormula');
  const calcInputCost = document.getElementById('calcInputCost');
  const calcOutputCost = document.getElementById('calcOutputCost');
  const breakdownTotalDisplay = document.getElementById('breakdownTotalDisplay');

  const costPerRequestEl = document.getElementById('costPerRequest');
  const dailyCostEl = document.getElementById('dailyCost');
  const monthlyCostEl = document.getElementById('monthlyCost');
  const dailyNoteEl = document.getElementById('dailyNote');

  const volumeChips = document.querySelectorAll('.volume-chip');
  const scenarioPills = document.querySelectorAll('.scenario-pill');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const resetBtn = document.getElementById('resetBtn');

  function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function formatUSD(value) {
    const abs = Math.abs(value);
    let maxDp = 2;
    if (abs > 0 && abs < 1) maxDp = 4;
    if (abs > 0 && abs < 0.01) maxDp = 6;
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: maxDp });
  }

  function formatRateStr(num) {
    if (num < 0.1) return '$' + num.toFixed(3);
    return '$' + num.toFixed(2);
  }

  function updateVolumeChips(val) {
    volumeChips.forEach(function (chip) {
      if (chip.getAttribute('data-val') === String(val)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  function calculateLLMCost() {
    const model = modelSelect.value;
    const systemTokens = Math.max(0, parseFloat(systemTokensEl.value) || 0);
    const userTokens = Math.max(0, parseFloat(userTokensEl.value) || 0);
    const outputTokens = Math.max(0, parseFloat(outputTokensEl.value) || 0);
    const dailyRequests = Math.max(0, parseFloat(dailyRequestsEl.value) || 0);

    const rates = PRICING[model] || { input: 0, output: 0, name: model };
    const totalInputTokens = systemTokens + userTokens;

    // Update rate preview
    if (inputRateVal && outputRateVal) {
      inputRateVal.textContent = formatRateStr(rates.input);
      outputRateVal.textContent = formatRateStr(rates.output);
    }

    const inputCost = totalInputTokens * (rates.input / 1000000);
    const outputCost = outputTokens * (rates.output / 1000000);
    const totalRequestCost = inputCost + outputCost;

    const costPerRequest = roundTo(totalRequestCost, 8);
    const dailyTotal = roundTo(costPerRequest * dailyRequests, 6);
    const monthlyTotal = roundTo(dailyTotal * 30, 6);

    // Update Transparent Math Breakdown
    if (calcTotalInputTokens) calcTotalInputTokens.textContent = totalInputTokens.toLocaleString();
    if (calcOutputTokens) calcOutputTokens.textContent = outputTokens.toLocaleString();
    if (calcInputFormula) calcInputFormula.textContent = `${totalInputTokens} × ${formatRateStr(rates.input)} / 1M`;
    if (calcOutputFormula) calcOutputFormula.textContent = `${outputTokens} × ${formatRateStr(rates.output)} / 1M`;
    if (calcInputCost) calcInputCost.textContent = '$' + inputCost.toFixed(6);
    if (calcOutputCost) calcOutputCost.textContent = '$' + outputCost.toFixed(6);
    if (breakdownTotalDisplay) breakdownTotalDisplay.textContent = '$' + costPerRequest.toFixed(6) + ' / call';

    // Update KPI tiles
    costPerRequestEl.innerText = '$' + costPerRequest.toFixed(6);
    dailyCostEl.innerText = formatUSD(dailyTotal);
    monthlyCostEl.innerText = formatUSD(monthlyTotal);

    if (dailyNoteEl) {
      dailyNoteEl.innerText = `${dailyRequests.toLocaleString()} calls / day`;
    }
  }

  // Bind Input Listeners
  [modelSelect, systemTokensEl, userTokensEl, outputTokensEl, dailyRequestsEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener('input', function () {
      if (el === dailyRequestsEl) {
        updateVolumeChips(el.value);
      }
      // Clear scenario pill if user customizes fields
      if (el !== dailyRequestsEl) {
        scenarioPills.forEach(p => p.classList.remove('active'));
      }
      calculateLLMCost();
    });
    el.addEventListener('change', calculateLLMCost);
  });

  // Volume Chips Click
  volumeChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const val = chip.getAttribute('data-val');
      dailyRequestsEl.value = val;
      updateVolumeChips(val);
      calculateLLMCost();
    });
  });

  // Scenario Presets Click
  scenarioPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      scenarioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const scenarioKey = pill.getAttribute('data-scenario');
      const sc = SCENARIOS[scenarioKey];
      if (sc) {
        systemTokensEl.value = sc.system;
        userTokensEl.value = sc.user;
        outputTokensEl.value = sc.output;
        dailyRequestsEl.value = sc.requests;
        updateVolumeChips(sc.requests);
        calculateLLMCost();
      }
    });
  });

  // Copy Estimate to Clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      const model = modelSelect.options[modelSelect.selectedIndex].text;
      const text = [
        `LLM Cost Estimate (${model})`,
        `----------------------------------------`,
        `System Prompt: ${systemTokensEl.value} tokens`,
        `User Message: ${userTokensEl.value} tokens`,
        `Output Tokens: ${outputTokensEl.value} tokens`,
        `Daily Requests: ${dailyRequestsEl.value} calls/day`,
        `----------------------------------------`,
        `Cost per Request: ${costPerRequestEl.innerText}`,
        `Daily Spend: ${dailyCostEl.innerText}`,
        `Monthly Total (30d): ${monthlyCostEl.innerText}`
      ].join('\n');

      navigator.clipboard.writeText(text).then(function () {
        const originalText = copyBtnText.innerText;
        copyBtnText.innerText = 'Copied!';
        setTimeout(function () {
          copyBtnText.innerText = originalText;
        }, 2000);
      }).catch(function () {
        alert(text);
      });
    });
  }

  // Reset to Defaults
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      modelSelect.value = 'gpt-4o-mini';
      const sc = SCENARIOS.chat;
      systemTokensEl.value = sc.system;
      userTokensEl.value = sc.user;
      outputTokensEl.value = sc.output;
      dailyRequestsEl.value = sc.requests;
      updateVolumeChips(sc.requests);
      scenarioPills.forEach(function (pill) {
        if (pill.getAttribute('data-scenario') === 'chat') {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
      calculateLLMCost();
    });
  }

  // Initial Calculation
  calculateLLMCost();
})();