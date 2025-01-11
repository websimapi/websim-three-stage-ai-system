window.stageEventBus.dispatchEvent(new CustomEvent('stage2-to-stage1', {
  detail: { prompt: 'new prompt text' }
}));