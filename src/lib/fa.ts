const DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export const fa = (value: number | string) => String(value).replace(/\d/g, (d) => DIGITS[+d]);

export const fromFa = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String(DIGITS.indexOf(d))).replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x660));
