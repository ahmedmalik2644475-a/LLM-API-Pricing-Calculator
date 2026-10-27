(function () {
  // Model Rates per 1,000,000 Tokens
  const PRICING = {
    // OpenAI ChatGPT / Reasoning
    "gpt-5-nano": { input: 0.05, output: 0.40 },
    "gpt-4o-mini": { input: 0.15, output: 0.60 },
    "gpt-5.4-mini": { input: 0.75, output: 4.50 },
    "o3-mini": { input: 1.10, output: 4.40 },
    "gpt-4o": { input: 2.50, output: 10.00 },
    "o1": { input: 15.00, output: 60.00 },
    "gpt-4.5": { input: 75.00, output: 150.00 },

    // Google Gemini
    "gemini-2.0-flash-lite": { input: 0.075, output: 0.30 },
    "gemini-2.0-flash": { input: 0.10, output: 0.40 },
    "gemini-1.5-pro": { input: 1.25, output: 5.00 },
    "gemini-2.5-pro": { input: 1.25, output: 10.00 },

    // Anthropic Claude
    "claude-3.5-haiku": { input: 0.80, output: 4.00 },
    "claude-3.5-sonnet": { input: 3.00, output: 15.00 },
    "claude-3-opus": { input: 15.00, output: 75.00 },

    // DeepSeek
    "deepseek-v3": { input: 0.14, output: 0.28 },
    "deepseek-r1": { input: 0.55, output: 2.19 },

    // Meta Llama
    "llama-3.3-70b": { input: 0.59, output: 0.79 },
    "llama-3.1-405b": { input: 3.50, output: 3.50 },

    // Mistral
    "mistral-small": { input: 0.20, output: 0.60 },
    "mistral-large": { input: 2.00, output: 6.00 }
  };

  const modelSelect = document.getElementById('modelSelect');
  const systemTokensEl = document.getElementById('systemTokens');
  const userTokensEl = document.getElementById('userTokens');
  const outputTokensEl = document.getElementById('outputTokens');
  const dailyRequestsEl = document.getElementById('dailyRequests');

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

  function calculateLLMCost() {
    const model = modelSelect.value;
    const systemTokens = Math.max(0, parseFloat(systemTokensEl.value) || 0);
    const userTokens = Math.max(0, parseFloat(userTokensEl.value) || 0);
    const outputTokens = Math.max(0, parseFloat(outputTokensEl.value) || 0);
    const dailyRequests = Math.max(0, parseFloat(dailyRequestsEl.value) || 0);

    const rates = PRICING[model] || { input: 0, output: 0 };
    const totalInputTokens = systemTokens + userTokens;

    const inputCost = totalInputTokens * (rates.input / 1000000);
    const outputCost = outputTokens * (rates.output / 1000000);
    const costPerRequest = roundTo(inputCost + outputCost, 8);

    const dailyTotal = roundTo(costPerRequest * dailyRequests, 6);
    const monthlyTotal = roundTo(dailyTotal * 30, 6);

    document.getElementById('costPerRequest').innerText = '$' + costPerRequest.toFixed(6);
    document.getElementById('dailyCost').innerText = formatUSD(dailyTotal);
    document.getElementById('monthlyCost').innerText = formatUSD(monthlyTotal);
  }

  [modelSelect, systemTokensEl, userTokensEl, outputTokensEl, dailyRequestsEl].forEach(function (el) {
    el.addEventListener('input', calculateLLMCost);
    el.addEventListener('change', calculateLLMCost);
  });

  calculateLLMCost();
})();