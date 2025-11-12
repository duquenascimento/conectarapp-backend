export function capitalizeWithExceptions(text: string): string {
  const prepositions = [
    'da',
    'do',
    'de',
    'das',
    'dos',
    'e',
    'em',
    'na',
    'no',
    'nas',
    'nos',
    'a',
    'o',
  ];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && prepositions.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}
