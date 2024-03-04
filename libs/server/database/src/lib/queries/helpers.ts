export function escapeArrayToSQL(elements: string[]): string {
  return `${elements.map((element) => `'${element}'`).join(',')}`;
}
