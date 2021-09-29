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
  if (n === 15) {
    return 'Fifteen';
  }
  if (n === 16) {
    return 'Sixteen';
  }

  return 'Something';
}

export function similarWayOfDoingIt(): string {
  const num = 1;

  if (num === 1) {
    return 'One';
  }
  if (num === 2) {
    return 'Two';
  }
  if (num === 3) {
    return 'Three';
  }
  if (num === 4) {
    return 'Four';
  }
  if (num === 5) {
    return 'Five';
  }
  if (num === 6) {
    return 'Six';
  }
  if (num === 7) {
    return 'Seven';
  }
  if (num === 8) {
    return 'Eight';
  }
  if (num === 9) {
    return 'Nine';
  }
  if (num === 10) {
    return 'Ten';
  }
  if (num === 11) {
    return 'Eleven';
  }
  if (num === 12) {
    return 'Twelve';
  }
  if (num === 13) {
    return 'Thirteen';
  }
  if (num === 14) {
    return 'Fourteen';
  }
  if (num === 15) {
    return 'Fifteen';
  }
  if (num === 16) {
    return 'Sixteen';
  }

  return 'Something';
}
