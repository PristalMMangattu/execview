/**
 * Advanced Extensions & Utilities
 * Additional features and utilities for enhanced visualization
 */

import Konva from 'konva';
import { ArrayVisualizer, VisualizationConfig, PASTEL_COLORS } from './fileviz';

/**
 * Extended visualizer with additional features
 */
class AdvancedArrayVisualizer extends ArrayVisualizer {
  private gridLines: Konva.Line[] = [];
  private isGridVisible: boolean = false;

  /**
   * Toggle grid overlay
   */
  public toggleGrid(): void {
    this.isGridVisible = !this.isGridVisible;
    this.gridLines.forEach((line) => {
      line.visible(this.isGridVisible);
    });
  }

  /**
   * Add grid lines for reference
   */
  private addGrid(): void {
    // This would require access to layer - extend as needed
  }

  /**
   * Highlight a specific box
   */
  public highlightBox(index: number, color: string = '#FF6B6B'): void {
    // Implementation for highlighting
  }
}

/**
 * Comparison visualizer for multiple arrays
 */
class ComparisonVisualizer {
  private visualizers: ArrayVisualizer[] = [];
  private container: HTMLElement;

  constructor(containerId: string, arrays: number[][], configs?: Partial<VisualizationConfig>[]) {
    this.container = document.getElementById(containerId) as HTMLElement;
    if (!this.container) {
      throw new Error(`Container not found: ${containerId}`);
    }

    this.container.style.display = 'flex';
    this.container.style.gap = '20px';
    this.container.style.flexWrap = 'wrap';

    arrays.forEach((numbers, index) => {
      const subContainer = document.createElement('div');
      subContainer.id = `viz-${index}`;
      subContainer.style.flex = '1';
      subContainer.style.minWidth = '400px';
      subContainer.style.height = '500px';
      this.container.appendChild(subContainer);

      const config = configs?.[index] || {};
      const visualizer = new ArrayVisualizer({
        containerSelector: `#viz-${index}`,
        numbers,
        ...config,
      });

      this.visualizers.push(visualizer);
    });
  }

  /**
   * Update all visualizations
   */
  public updateAll(arrays: number[][]): void {
    arrays.forEach((numbers, index) => {
      if (this.visualizers[index]) {
        this.visualizers[index].updateData(numbers);
      }
    });
  }
}

/**
 * Animation utilities
 */
class AnimationUtils {
  /**
   * Ease-in animation
   */
  static easeIn(t: number): number {
    return t * t;
  }

  /**
   * Ease-out animation
   */
  static easeOut(t: number): number {
    return t * (2 - t);
  }

  /**
   * Ease-in-out animation
   */
  static easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Elastic ease-out
   */
  static elasticOut(t: number): number {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c5) + 1;
  }
}

/**
 * Color utilities for pastel palettes
 */
class ColorUtils {
  /**
   * Generate random pastel color
   */
  static randomPastel(): string {
    return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
  }

  /**
   * Generate gradient between two pastel colors
   */
  static gradient(color1: string, color2: string, steps: number): string[] {
    const colors: string[] = [];
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    }

    return colors;
  }

  /**
   * Lighten color
   */
  static lighten(color: string, amount: number): string {
    const r = Math.min(255, parseInt(color.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(color.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(color.slice(5, 7), 16) + amount);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Darken color
   */
  static darken(color: string, amount: number): string {
    const r = Math.max(0, parseInt(color.slice(1, 3), 16) - amount);
    const g = Math.max(0, parseInt(color.slice(3, 5), 16) - amount);
    const b = Math.max(0, parseInt(color.slice(5, 7), 16) - amount);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Data utilities
 */
class DataUtils {
  /**
   * Validate if array is sorted
   */
  static isSorted(numbers: number[]): boolean {
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] < numbers[i - 1]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Sort array
   */
  static sort(numbers: number[]): number[] {
    return [...numbers].sort((a, b) => a - b);
  }

  /**
   * Generate random array
   */
  static generateRandom(size: number, min: number = 0, max: number = 100): number[] {
    const arr: number[] = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return DataUtils.sort(arr);
  }

  /**
   * Generate arithmetic sequence
   */
  static generateArithmetic(start: number, diff: number, count: number): number[] {
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      arr.push(start + i * diff);
    }
    return arr;
  }

  /**
   * Generate Fibonacci-like sequence
   */
  static generateFibonacci(count: number, start1: number = 1, start2: number = 1): number[] {
    if (count <= 0) return [];
    if (count === 1) return [start1];

    const arr: number[] = [start1, start2];
    for (let i = 2; i < count; i++) {
      arr.push(arr[i - 1] + arr[i - 2]);
    }
    return arr;
  }

  /**
   * Get statistics about array
   */
  static getStats(numbers: number[]): {
    min: number;
    max: number;
    mean: number;
    median: number;
    differences: number[];
  } {
    const differences: number[] = [];
    for (let i = 1; i < numbers.length; i++) {
      differences.push(numbers[i] - numbers[i - 1]);
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];

    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      median,
      differences,
    };
  }
}

// Export utilities
export { AdvancedArrayVisualizer, ComparisonVisualizer, AnimationUtils, ColorUtils, DataUtils };