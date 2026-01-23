// This is a file which exposes the API for index.html

export const actionMap: Record<string, () => void> = {
  'Overview': showOverview,
  'Sections': showSections,
  'Segments': showSegments,
  'Symbols': showSymbols
};

export async function showOverview(this: HTMLButtonElement): Promise<void> {
  console.log("showOverview is clicked");
  return;

}

export async function showSections(this: HTMLButtonElement): Promise<void> {
  console.log("showSections is clicked");
  return;

}

export async function showSegments(this: HTMLButtonElement): Promise<void> {
  console.log("showSegments is clicked");
  return;

}

export async function showSymbols(this: HTMLButtonElement): Promise<void> {
  console.log("showSymbols is clicked");
  return;

}
