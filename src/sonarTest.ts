/* eslint-disable require-jsdoc */
const myArray: (string | number | null)[] = [
  1,
  '2',
  null,
  4,
  5,
  6,
  'siete',
  null,
  9,
  10,
  'eleven',
  null,
];

myArray.sort();

export function firstElement(): string | number | null {
  const element = myArray[0];

  return element;
}

export function secondElement(): string | number | null {
  return myArray[1];
}

export function thirdElement(): string | number | null {
  return myArray[2];
}

export function numberToWord(n: number): string {
  if (n === 1) {
    return 'One';
  }
  if (n === 2) {
    return 'Two';
  }
  if (n === 3) {
    return 'Three';
  }
  if (n === 4) {
    return 'Four';
  }
  if (n === 5) {
    return 'Five';
  }
  if (n === 6) {
    return 'Six';
  }
  if (n === 7) {
    return 'Seven';
  }
  if (n === 8) {
    return 'Eight';
  }
  if (n === 9) {
    return 'Nine';
  }
  if (n === 10) {
    return 'Ten';
  }
  if (n === 11) {
    return 'Eleven';
  }
  if (n === 12) {
    return 'Twelve';
  }
  if (n === 13) {
    return 'Thirteen';
  }
  if (n === 14) {
    return 'Fourteen';
  }

  return 'Something';
}

export function similarWayOfDoingIt(): string {
  const n = 1;

  if (n === 1) {
    return 'One';
  }
  if (n === 2) {
    return 'Two';
  }
  if (n === 3) {
    return 'Three';
  }
  if (n === 4) {
    return 'Four';
  }
  if (n === 5) {
    return 'Five';
  }
  if (n === 6) {
    return 'Six';
  }
  if (n === 7) {
    return 'Seven';
  }
  if (n === 8) {
    return 'Eight';
  }
  if (n === 9) {
    return 'Nine';
  }
  if (n === 10) {
    return 'Ten';
  }
  if (n === 11) {
    return 'Eleven';
  }
  if (n === 12) {
    return 'Twelve';
  }
  if (n === 13) {
    return 'Thirteen';
  }
  if (n === 14) {
    return 'Fourteen';
  }

  return 'Something';
}
