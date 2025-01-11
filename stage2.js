// Stage 2 - In-Site LLM
export class Stage2Handler {
  constructor() {
    this.lastRequestTime = this.getStoredLastRequestTime();
    this.cooldownDuration = 180000; // 3 minutes in milliseconds
    this.setupElements();
    this.setupEventListeners();
    this.updateCooldownTimer();
  }

  setupElements() {
    this.input = document.getElementById('llm-input');
    this.submitButton = document.getElementById('llm-submit');
    this.skipButton = document.getElementById('skip-cooldown');
    this.cooldownDisplay = document.getElementById('cooldown-timer');
    this.responseContainer = document.getElementById('llm-response');
    this.memoryDisplay = document.getElementById('llm-memory-display');
  }

  setupEventListeners() {
    this.submitButton.addEventListener('click', () => this.handleSubmit());
    this.skipButton.addEventListener('click', () => this.skipCooldown());
  }

  getStoredLastRequestTime() {
    return parseInt(localStorage.getItem('lastLLMRequestTime')) || 0;
  }

  updateLastRequestTime() {
    this.lastRequestTime = Date.now();
    localStorage.setItem('lastLLMRequestTime', this.lastRequestTime.toString());
  }

  skipCooldown() {
    this.lastRequestTime = 0;
    localStorage.setItem('lastLLMRequestTime', '0');
    this.updateCooldownTimer();
  }

  updateCooldownTimer() {
    const updateTimer = () => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const remainingCooldown = Math.max(0, this.cooldownDuration - timeSinceLastRequest);
      
      if (remainingCooldown === 0) {
        this.cooldownDisplay.textContent = 'Ready';
        this.submitButton.disabled = false;
      } else {
        const secondsRemaining = Math.ceil(remainingCooldown / 1000);
        this.cooldownDisplay.textContent = `Cooldown: ${secondsRemaining}s`;
        this.submitButton.disabled = true;
        requestAnimationFrame(updateTimer);
      }
    };

    updateTimer();
  }

  async handleSubmit() {
    const now = Date.now();
    if (now - this.lastRequestTime < this.cooldownDuration) {
      alert('Please wait for the cooldown to finish');
      return;
    }

    const input = this.input.value.trim();
    if (!input) return;

    try {
      const response = await this.makeAIRequest(input);
      this.updateLastRequestTime();
      this.updateCooldownTimer();
      this.storeMemory(input, response);
      this.displayResponse(response);
    } catch (error) {
      console.error('Error:', error);
      this.displayResponse('Error processing request');
    }
  }

  async makeAIRequest(input) {
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          data: this.getStoredMemories()
        })
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Request Error:', error);
      throw error;
    }
  }

  storeMemory(input, response) {
    const memories = this.getStoredMemories();
    memories.push({ input, response, timestamp: Date.now() });
    localStorage.setItem('llmMemories', JSON.stringify(memories));
    this.updateMemoryDisplay();
  }

  getStoredMemories() {
    return JSON.parse(localStorage.getItem('llmMemories')) || [];
  }

  updateMemoryDisplay() {
    const memories = this.getStoredMemories();
    this.memoryDisplay.innerHTML = '<h3>Recent Memories</h3>' + 
      memories.slice(-5).map(m => `
        <div class="memory-item">
          <strong>Input:</strong> ${m.input}<br>
          <strong>Response:</strong> ${m.response}
        </div>
      `).join('');
  }

  displayResponse(response) {
    this.responseContainer.innerHTML = `<p>${response}</p>`;
  }
}