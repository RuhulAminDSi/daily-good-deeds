/** Joins class names, skipping falsy ones. (No merging: component classes and overrides must not
 *  overlap; token utilities like `text-h1` and `text-primary` would confuse a merger.) */
export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');
