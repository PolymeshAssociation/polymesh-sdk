/**
 * Check the length of a given string to ensure it meets correct bounds
 *
 * @param value - the string itself
 * @param variableName - the name of the variable associated to the string itself
 * @param opts - optional min and max length of the string. Defaults to a minimum of 0 (empty string) and a maximum of 32 characters
 */
export function checkStringLength(
  value: string,
  variableName: string,
  opts: { minLength?: number; maxLength: number } = { maxLength: 32 }
): void {
  const { minLength = 0, maxLength } = opts;
  if (value.length < minLength || value.length > maxLength) {
    throw new Error(
      `You must provide a valid ${variableName} ${
        opts.minLength !== undefined
          ? `between ${minLength} and ${maxLength}`
          : `up to ${maxLength}`
      } characters long`
    );
  }
}
