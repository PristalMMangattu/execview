// This is some configuration variables

export const CHECK_STATE_INTERVAL = 1000; // milliseconds
// This is the common abstractions on which viz and *viz files depend on.



/*========== VISUALIZATION PARAMETERS =============*/
export const KONVA_STAGE_WIDTH = 1200;
export const KONVA_STAGE_HEIGHT = 2400;

export const PASTEL_COLORS = [
  '#BAE1FF', // Pastel Blue (cool start)
  '#FFB3BA', // Pastel Red (warm contrast)
  '#BAFFC9', // Pastel Mint (cool green)
  '#FFE5BA', // Pastel Peach (warm orange)
  '#D5AAFF', // Pastel Lavender (cool purple)
  '#FFCCCB', // Pastel Light Red (warm pink)
  '#84DCC6', // Pastel Teal (new cool cyan, high contrast to reds)
  '#FFBABA', // Pastel Coral (warm)
  '#E0BBE4', // Pastel Purple (cool)
  '#FFFFBA', // Pastel Yellow (warm)
  '#B5E48C', // Pastel Lime (new cool green, contrasts yellow)
  '#FFB3D9', // Pastel Pink (warm)
  '#A5F2F3', // Pastel Aquamarine (new cool, contrasts pinks)
  '#FFDFBA', // Pastel Apricot (new warm orange)
  '#D4F4DD', // Pastel Sage (new muted cool green)
  '#FFF3E0', // Pastel Cream Orange (new warm neutral close)
];

/*========== PARAMETERS FOR DISPLAY PORT =============*/
export const FV_TOP_MARGINE: number = 80; // Top margin for vizuals
export const FV_BOTTOM_MARGINE: number = 80; // Top margin for vizuals


/*========== PARAMETERS FOR FILE OVERVIEW =============*/

/* Config for file view */
export const FV_BOX_WIDTH: number = 300; // Width of each boxs
export const FV_MINIMUM_SIZE: number = 100; // if size is less than this then to display the name properly this will be considered.
export const FV_LEFT_MARGINE: number = 80; // Left margin for vizuals
export const FV_SCALE_FACTOR: number = 0.5; // The view will be scaled by this factor.
export const FV_ANIMATE: boolean = true;

/* Files sections info that should be derived from elf header */
export interface FileArea {
  name: string, // Name of that area
  addr: number, // Start Address of the area
  size: number, // Size of the area
}

