export function varifyPlaceholderText(descriptionVar: string, placeholderString: string): string | undefined {
  return descriptionVar ? `${descriptionVar.split('.description')[0]}.${placeholderString}` : undefined
}
