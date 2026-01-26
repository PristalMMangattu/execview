/**
 * Advanced Extensions & Utilities
 * Additional features and utilities for enhanced visualization
 */
import * as def from './define';

/* Transform to range */
export function transformToRange(point: number, fromStart: number, fromEnd: number, toStart: number, toEnd: number): number {
  return ((point - fromStart) / (fromEnd - fromStart)) * (toEnd - toStart);
}

/**
 * Animation utilities
 */
export class AnimationUtils {
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
export class ColorUtils {
  /**
   * Generate random pastel color
   */
  static randomPastel(): string {
    return def.PASTEL_COLORS[Math.floor(Math.random() * def.PASTEL_COLORS.length)];
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

