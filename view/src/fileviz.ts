/**
 * Array Difference Visualization using Konva.js
 * Visualizes an array of sorted numbers as stacked boxes
 * where height represents the difference between consecutive numbers
 */
import * as def from './define';
import Konva from 'konva';


interface VisualizationConfig {
  containerSelector: string;
  info: def.FileArea[];
  boxWidth?: number;
  scaleFactor?: number;
  paddingX?: number;
  paddingY?: number;
}

interface Box {
  value: string;
  height: number;
  yOffset: number;
  color: string;
}


/**
 * ArrayVisualizer - Main visualization class
 */
class ArrayVisualizer {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private boxes: Box[] = [];
  private rectangles: Konva.Rect[] = [];
  private labels: Konva.Text[] = [];
  private info: def.FileArea[] = [];

  constructor(stage: Konva.Stage, info: def.FileArea[]) {
    // Validate input
    if (!info || info.length === 0) {
      throw new Error('Numbers array must not be empty');
    }
    this.stage = stage;
    this.info = info;
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    this.initialize();
  }

  /**
   * Calculate boxes from the array differences
   */
  private calculateBoxes(): void {
    this.boxes = [];

    for (let i = 0; i < this.info.length - 1; i++) {
      const color = def.PASTEL_COLORS[i % def.PASTEL_COLORS.length];
      const height = this.info[i].size * def.FV_SCALE_FACTOR;
      console.log(`Height for box ${i} : ${height}`);
      const yOffset = def.FV_TOP_MARGINE + this.info[i].addr * def.FV_SCALE_FACTOR;

      this.boxes.push({
        value: this.info[i].name,
        height: this.info[i].size * def.FV_SCALE_FACTOR,
        yOffset: def.FV_TOP_MARGINE + this.info[i].addr * def.FV_SCALE_FACTOR,
        color,
      });

    }
  }

  /**
   * Draw stacked boxes
   */
  private drawBoxes(): void {
    let boxIndex = 0;

    for (const box of this.boxes) {
      const x = def.FV_TOP_MARGINE;
      const y = def.FV_LEFT_MARGINE + box.yOffset;

      const rect = new Konva.Rect({
        x,
        y,
        width: def.FV_BOX_WIDTH,
        height: box.height,
        fill: box.color,
        stroke: '#555',
        strokeWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.5,
      });

      // Add hover effect
      rect.on('mouseenter', () => {
        rect.shadowBlur(10);
        rect.shadowOpacity(0.8);
        this.stage.batchDraw();
      });

      rect.on('mouseleave', () => {
        rect.shadowBlur(5);
        rect.shadowOpacity(0.5);
        this.stage.batchDraw();
      });

      this.layer.add(rect);
      this.rectangles.push(rect);

      // Animate entrance if enabled
      if (def.FV_ANIMATE) {
        rect.height(0);
        rect.y(y + box.height);
        const anim = new Konva.Animation((frame) => {
          const progress = Math.min((frame?.time || 0) / 300, 1); // 300ms animation
          rect.height(box.height * progress);
          rect.y(y + box.height * (1 - progress));
        }, this.layer);
        anim.start();
      }

      // Add label showing the difference value
      const label = new Konva.Text({
        x: x + def.FV_BOX_WIDTH / 2,
        y: y + box.height / 2,
        text: `+${box.value}`,
        fontSize: 14,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: '#333',
        align: 'center',
        verticalAlign: 'middle',
      });
      this.layer.add(label);
      this.labels.push(label);

      boxIndex++;
    }
  }

  /**
   * Draw title and legend
   */
  private drawLabels(): void {
    const title = new Konva.Text({
      x: this.stage.width() / 2,
      y: 20,
      text: 'File Overview',
      fontSize: 20,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#333',
      align: 'center',
      offsetX: 100, // Rough center offset
    });
    this.layer.add(title);

    // Legend
    let legendY = 50;
    const legendX = def.FV_LEFT_MARGINE + def.FV_BOX_WIDTH + 60;

    const legendTitle = new Konva.Text({
      x: legendX,
      y: legendY,
      text: 'Differences:',
      fontSize: 12,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fill: '#333',
    });
    this.layer.add(legendTitle);

    legendY += 25;
    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];
      const legendColorBox = new Konva.Rect({
        x: legendX,
        y: legendY,
        width: 15,
        height: 15,
        fill: box.color,
        stroke: '#555',
        strokeWidth: 1,
      });
      this.layer.add(legendColorBox);

      const legendText = new Konva.Text({
        x: legendX + 20,
        y: legendY,
        text: `${this.info[i].addr} →  ${this.info[i].addr} +  ${this.info[i].size} (${this.info[i].name})`,
        fontSize: 11,
        fontFamily: 'Arial',
        fill: '#333',
      });
      this.layer.add(legendText);

      legendY += 20;
    }
  }

  /**
   * Initialize and render the visualization
   */
  private initialize(): void {
    this.calculateBoxes();
    this.drawBoxes();
    this.drawLabels();
    this.layer.draw();
  }

  /**
   * Update with new data
   */
  public updateData(info: def.FileArea[]): void {
    this.layer.destroyChildren();
    this.rectangles = [];
    this.labels = [];
    this.boxes = [];

    this.initialize();
  }

  /**
   * Resize the stage
   */
  public resize(width: number, height: number): void {
    this.stage.width(width);
    this.stage.height(height);
    this.stage.draw();
  }

  /**
   * Export as image
   */
  public exportAsImage(filename: string = 'visualization.png'): void {
    const dataURL = this.stage.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.click();
  }
}

// Export for use in other modules
export { ArrayVisualizer, VisualizationConfig };
