import { Stage1Handler } from './stage1.js';
import { Stage2Handler } from './stage2.js';
import { Stage3Handler } from './stage3.js';

class SystemController {
  constructor() {
    this.stage1 = new Stage1Handler();
    this.stage2 = new Stage2Handler();
    this.stage3 = new Stage3Handler();
    
    // Set up communication between stages
    this.setupInterStageComm();
  }

  setupInterStageComm() {
    // Event bus for inter-stage communication
    window.stageEventBus = new EventTarget();
    
    // Example of stage2 triggering stage1
    window.stageEventBus.addEventListener('stage2-to-stage1', (event) => {
      this.stage1.updateSonnetPrompt(event.detail.prompt);
    });
  }
}

// Initialize the system
window.addEventListener('DOMContentLoaded', () => {
  window.systemController = new SystemController();
});