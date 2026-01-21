/**
 * Array Difference Visualization using Konva.js
 * Visualizes an array of sorted numbers as stacked boxes
 * where height represents the difference between consecutive numbers
 */

import Konva from 'konva';

// Pastel color palette for visual appeal
const PASTEL_COLORS = [
  '#FFB3BA', // Pastel Red
  '#FFCCCB', // Pastel Light Red
  '#FFBABA', // Pastel Coral
  '#FFB3D9', // Pastel Pink
  '#E0BBE4', // Pastel Purple
  '#D5AAFF', // Pastel Lavender
  '#BAFFC9', // Pastel Mint
  '#BAE1FF', // Pastel Blue
  '#FFFFBA', // Pastel Yellow
  '#FFE5BA', // Pastel Peach
];

interface VisualizationConfig {
  containerSelector: string;
  numbers: number[];
  boxWidth?: number;
  scaleFactor?: number;
  paddingX?: number;
  paddingY?: number;
  enableArrows?: boolean;
  enableAnimations?: boolean;
}

interface Box {
  value: number;
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
  private numbers: number[];
  private config: Required<VisualizationConfig>;
  private boxes: Box[] = [];
  private rectangles: Konva.Rect[] = [];
  private labels: Konva.Text[] = [];

  constructor(config: VisualizationConfig) {
    // Validate input
    if (!config.numbers || config.numbers.length === 0) {
      throw new Error('Numbers array must not be empty');
    }

    // Verify array is sorted
    for (let i = 1; i < config.numbers.length; i++) {
      if (config.numbers[i] < config.numbers[i - 1]) {
        throw new Error('Numbers array must be in increasing order');
      }
    }

    // Set defaults
    this.config = {
      containerSelector: config.containerSelector,
      numbers: config.numbers,
      boxWidth: config.boxWidth ?? 60,
      scaleFactor: config.scaleFactor ?? 15,
      paddingX: config.paddingX ?? 80,
      paddingY: config.paddingY ?? 60,
      enableArrows: config.enableArrows ?? true,
      enableAnimations: config.enableAnimations ?? true,
    };

    this.numbers = config.numbers;

    // Initialize Konva stage
    const container = document.querySelector(this.config.containerSelector) as HTMLElement;
    if (!container) {
      throw new Error(`Container not found: ${this.config.containerSelector}`);
    }

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 800;

    this.stage = new Konva.Stage({
      container: this.config.containerSelector,
      width,
      height,
    });

    this.layer = new Konva.Layer();
    this.stage.add(this.layer);

    this.initialize();
  }

  /**
   * Calculate boxes from the array differences
   */
  private calculateBoxes(): void {
    this.boxes = [];
    let cumulativeHeight = 0;

    for (let i = 0; i < this.numbers.length - 1; i++) {
      const diff = this.numbers[i + 1] - this.numbers[i];
      const height = diff * this.config.scaleFactor;
      const color = PASTEL_COLORS[i % PASTEL_COLORS.length];

      this.boxes.push({
        value: diff,
        height,
        yOffset: cumulativeHeight,
        color,
      });

      cumulativeHeight += height;
    }
  }

  /**
   * Draw the y-axis with labels
   */
  private drawYAxis(): void {
    const axisX = this.config.paddingX - 20;
    const axisStartY = this.config.paddingY;
    const totalHeight = this.boxes.reduce((sum, box) => sum + box.height, 0);
    const axisEndY = axisStartY + totalHeight;

    // Y-axis line
    const axisLine = new Konva.Line({
      points: [axisX, axisStartY, axisX, axisEndY],
      stroke: '#333',
      strokeWidth: 2,
    });
    this.layer.add(axisLine);

    // Y-axis labels at each boundary
    let currentY = axisStartY;
    for (let i = 0; i <= this.numbers.length; i++) {
      const label = new Konva.Text({
        x: axisX - 40,
        y: currentY - 8,
        text: this.numbers[i]?.toString() || this.numbers[0].toString(),
        fontSize: 12,
        fontFamily: 'Arial',
        fill: '#333',
        align: 'right',
      });
      this.layer.add(label);

      // Small tick mark
      const tick = new Konva.Line({
        points: [axisX - 5, currentY, axisX, currentY],
        stroke: '#999',
        strokeWidth: 1,
      });
      this.layer.add(tick);

      if (i < this.numbers.length - 1) {
        currentY += this.boxes[i].height;
      }
    }
  }

  /**
   * Draw stacked boxes
   */
  private drawBoxes(): void {
    let boxIndex = 0;

    for (const box of this.boxes) {
      const x = this.config.paddingX;
      const y = this.config.paddingY + box.yOffset;

      const rect = new Konva.Rect({
        x,
        y,
        width: this.config.boxWidth,
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
      if (this.config.enableAnimations) {
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
        x: x + this.config.boxWidth / 2,
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
   * Draw arrows showing transitions between boxes
   */
  private drawArrows(): void {
    if (!this.config.enableArrows || this.rectangles.length < 2) {
      return;
    }

    const arrowOffsetX = this.config.boxWidth + 30;

    for (let i = 0; i < this.rectangles.length - 1; i++) {
      const currentBox = this.rectangles[i];
      const nextBox = this.rectangles[i + 1];

      const startX = currentBox.x() + this.config.boxWidth;
      const startY = currentBox.y() + currentBox.height();

      const endX = nextBox.x();
      const endY = nextBox.y();

      // Draw curved arrow
      this.drawCurvedArrow(startX, startY, endX, endY, '#999', 2);
    }
  }

  /**
   * Draw a curved arrow between two points
   */
  private drawCurvedArrow(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string,
    thickness: number
  ): void {
    const controlX = (fromX + toX) / 2 + 20;
    const controlY = (fromY + toY) / 2;

    // Draw curved line using quadratic bezier
    const curve = new Konva.Line({
      points: this.generateBezierPoints(fromX, fromY, controlX, controlY, toX, toY),
      stroke: color,
      strokeWidth: thickness,
      lineCap: 'round',
      lineJoin: 'round',
    });
    this.layer.add(curve);

    // Draw arrowhead
    this.drawArrowhead(toX, toY, controlX, controlY, color);
  }

  /**
   * Generate points for bezier curve
   */
  private generateBezierPoints(
    startX: number,
    startY: number,
    controlX: number,
    controlY: number,
    endX: number,
    endY: number,
    segments: number = 20
  ): number[] {
    const points: number[] = [];

    for (let t = 0; t <= 1; t += 1 / segments) {
      const x =
        Math.pow(1 - t, 2) * startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * endX;
      const y =
        Math.pow(1 - t, 2) * startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * endY;

      points.push(x, y);
    }

    return points;
  }

  /**
   * Draw arrowhead at the end point
   */
  private drawArrowhead(toX: number, toY: number, controlX: number, controlY: number, color: string): void {
    const angle = Math.atan2(toY - controlY, toX - controlX);
    const arrowSize = 10;

    const p1X = toX - arrowSize * Math.cos(angle - Math.PI / 6);
    const p1Y = toY - arrowSize * Math.sin(angle - Math.PI / 6);
    const p2X = toX - arrowSize * Math.cos(angle + Math.PI / 6);
    const p2Y = toY - arrowSize * Math.sin(angle + Math.PI / 6);

    const arrowhead = new Konva.Shape({
      sceneFunc: (context) => {
        context.beginPath();
        context.moveTo(toX, toY);
        context.lineTo(p1X, p1Y);
        context.lineTo(p2X, p2Y);
        context.closePath();
        context.fillStrokeShape(this as any);
      },
      fill: color,
    });
    this.layer.add(arrowhead);
  }

  /**
   * Draw title and legend
   */
  private drawLabels(): void {
    const title = new Konva.Text({
      x: this.stage.width() / 2,
      y: 20,
      text: 'Array Difference Visualization',
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
    const legendX = this.config.paddingX + this.config.boxWidth + 60;

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
        text: `${this.numbers[i]} → ${this.numbers[i + 1]} (diff: +${box.value})`,
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
    this.drawYAxis();
    this.drawBoxes();
    this.drawArrows();
    this.drawLabels();
    this.layer.draw();
  }

  /**
   * Update with new data
   */
  public updateData(numbers: number[]): void {
    // Verify array is sorted
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] < numbers[i - 1]) {
        throw new Error('Numbers array must be in increasing order');
      }
    }

    this.numbers = numbers;
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
export { ArrayVisualizer, VisualizationConfig, PASTEL_COLORS };