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
 * FileOverview - Main visualization class
 */
class FileOverview {
  private stage: Konva.Stage;
  private layer: Konva.Layer;
  private boxes: Box[] = [];
  private rectangles: Konva.Group[] = [];
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

    for (let i = 0; i < this.info.length; i++) {
      const color = def.PASTEL_COLORS[i % def.PASTEL_COLORS.length];

      this.boxes.push({
        value: this.info[i].name,
        height: 20,
        yOffset: def.FV_TOP_MARGINE + 20 * i,
        color,
      });

    }
  }

  /**
   * Draw stacked boxes
   */
  private drawBoxes(): void {
    for (const box of this.boxes) {
      const x = def.FV_LEFT_MARGINE;
      const y = box.yOffset;

      const rectGroup = new Konva.Group({
        x: x,
        y: y,
        width: def.FV_BOX_WIDTH,
        height: box.height,
      });

      rectGroup.add(new Konva.Rect({
        width: def.FV_BOX_WIDTH,
        height: box.height,
        fill: box.color,
        stroke: '#555',
        strokeWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 5,
        shadowOffset: { x: 2, y: 2 },
        shadowOpacity: 0.5,
      }));

      rectGroup.add(new Konva.Text({
        text: box.value,
        fontSize: 14,
        fontFamily: 'Arial',
        fontStyle: 'bold',
        fill: '#333',
        align: 'left',
        padding: 2,
        verticalAlign: 'middle',
      }));

      this.layer.add(rectGroup);
      this.rectangles.push(rectGroup);
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
export { FileOverview, VisualizationConfig };
