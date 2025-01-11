// Stage 3 - Transformers and Object Detection
export class Stage3Handler {
  constructor() {
    this.canvas = document.getElementById('output-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.video = document.getElementById('webcam');
    this.transformerOutput = document.getElementById('transformer-output');
    this.model = null;
    this.isRunning = false;
    this.initializeObjectDetection();
  }

  async initializeObjectDetection() {
    try {
      this.model = await cocoSsd.load();
      console.log('Object detection model loaded');
      await this.setupWebcam();
      this.startDetection();
    } catch (error) {
      console.error('Error initializing object detection:', error);
      this.transformerOutput.innerHTML = 'Error initializing object detection';
    }
  }

  async setupWebcam() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        this.video.srcObject = stream;
        return new Promise(resolve => {
          this.video.onloadedmetadata = () => {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            resolve();
          };
        });
      } catch (error) {
        console.error('Error accessing webcam:', error);
        throw error;
      }
    }
  }

  async detectObjects() {
    if (!this.isRunning) return;

    try {
      const predictions = await this.model.detect(this.video);
      this.drawPredictions(predictions);
      this.updateTransformerOutput(predictions);
    } catch (error) {
      console.error('Detection error:', error);
    }

    requestAnimationFrame(() => this.detectObjects());
  }

  drawPredictions(predictions) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);

      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(x, y - 20, 100, 20);
      this.ctx.fillStyle = '#000000';
      this.ctx.fillText(
        `${prediction.class} ${Math.round(prediction.score * 100)}%`,
        x, y - 5
      );
    });
  }

  updateTransformerOutput(predictions) {
    this.transformerOutput.innerHTML = `
      <h3>Detected Objects:</h3>
      ${predictions.map(p => `
        <div>${p.class} (${Math.round(p.score * 100)}% confidence)</div>
      `).join('')}
    `;
  }

  startDetection() {
    this.isRunning = true;
    this.detectObjects();
  }

  stopDetection() {
    this.isRunning = false;
  }
}