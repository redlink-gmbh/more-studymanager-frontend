export function varifyPlaceholderText(descriptionVar: string, placeholderString: string): string {
  const split = descriptionVar.split('.description'); // only now splits when description is part of i18n variable, to ensure correct handling
  return descriptionVar && split.length > 1 ? `${split[0]}.${placeholderString}` : descriptionVar
}
