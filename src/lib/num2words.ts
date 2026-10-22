// Число → русская пропись (для «сумма прописью» в документах).
// numToWordsRu(2150) → "две тысячи сто пятьдесят"

const UNITS_M = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const UNITS_F = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
const TEENS = [
  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать',
  'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
];
const TENS = ['', 'десять', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
const HUNDREDS = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];

// Склонение по остатку: [1, 2-4, 0/5-9]
function plural(n: number, forms: [string, string, string]): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  const mod10 = n % 10;
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function threeDigits(n: number, feminine: boolean): string[] {
  const out: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) out.push(HUNDREDS[h]);
  if (rest >= 10 && rest <= 19) {
    out.push(TEENS[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const u = rest % 10;
    if (t) out.push(TENS[t]);
    if (u) out.push((feminine ? UNITS_F : UNITS_M)[u]);
  }
  return out;
}

export function numToWordsRu(input: number): string {
  const n = Math.floor(Math.abs(input));
  if (n === 0) return 'ноль';

  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  if (millions) {
    parts.push(...threeDigits(millions, false), plural(millions, ['миллион', 'миллиона', 'миллионов']));
  }
  if (thousands) {
    parts.push(...threeDigits(thousands, true), plural(thousands, ['тысяча', 'тысячи', 'тысяч']));
  }
  if (rest) {
    parts.push(...threeDigits(rest, false));
  }
  return parts.join(' ');
}

// "60 000,00" → 60000; null если не число
export function parseMoney(text: string): number | null {
  const n = Number(text.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}
