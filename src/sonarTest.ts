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

export function someConvolutedPieceOfCode(array: number[]): number[] {
  array.reverse();
  array.sort();
  const otherArray = array.map(n => n * 2);

  otherArray.reverse();
  otherArray.sort();

  const thirdArray = array.concat(otherArray);

  thirdArray.reverse();
  thirdArray.sort();
  thirdArray.reverse();
  thirdArray.sort();
  thirdArray.reverse();
  thirdArray.sort();
  thirdArray.reverse();
  thirdArray.sort();
  thirdArray.reverse();
  thirdArray.sort();

  const fourthArray = thirdArray.map(n => n - 1);
  fourthArray.reverse();
  fourthArray.sort();
  fourthArray.reverse();
  fourthArray.sort();
  fourthArray.reverse();
  fourthArray.sort();
  fourthArray.reverse();
  fourthArray.sort();
  fourthArray.reverse();
  fourthArray.sort();

  if (fourthArray.length >= 10) {
    fourthArray.splice(1, 5);
  }

  switch (fourthArray[0]) {
    case 0: {
      console.log('ZERO');

      break;
    }
    case 1: {
      console.log('ONE');

      break;
    }
    case 2: {
      console.log('TWO');

      break;
    }
    case 3: {
      console.log('THREE');

      break;
    }
    case 4: {
      console.log('FOUR');

      break;
    }
    default: {
      console.log('NONE');

      break;
    }
  }

  return fourthArray;
}

export function anotherConvolutedPieceOfCodeThatDoesSomethingVerySimilar(): number[] {
  const someArray = [1, 2, 3, 4];

  someArray.reverse();
  someArray.sort();
  const secondArray = someArray.map(n => n * 2);

  secondArray.reverse();
  secondArray.sort();

  const renamedArray = someArray.concat(secondArray);

  renamedArray.reverse();
  renamedArray.sort();
  renamedArray.reverse();
  renamedArray.sort();
  renamedArray.reverse();
  renamedArray.sort();
  renamedArray.reverse();
  renamedArray.sort();
  renamedArray.reverse();
  renamedArray.sort();

  const notTheFourth = renamedArray.map(n => n - 1);
  notTheFourth.reverse();
  notTheFourth.sort();
  notTheFourth.reverse();
  notTheFourth.sort();
  notTheFourth.reverse();
  notTheFourth.sort();
  notTheFourth.reverse();
  notTheFourth.sort();
  notTheFourth.reverse();
  notTheFourth.sort();

  if (notTheFourth.length >= 10) {
    notTheFourth.splice(1, 5);
  }

  switch (notTheFourth[0]) {
    case 0: {
      console.log('ZERO');

      break;
    }
    case 1: {
      console.log('ONE');

      break;
    }
    case 2: {
      console.log('TWO');

      break;
    }
    case 3: {
      console.log('THREE');

      break;
    }
    case 4: {
      console.log('FOUR');

      break;
    }
    default: {
      console.log('NONE');

      break;
    }
  }

  return notTheFourth;
}
