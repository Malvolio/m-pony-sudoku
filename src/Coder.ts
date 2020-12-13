import { range } from "lodash";
import { CellMap, CellState, NumberMap } from "./GameTypes";

// 10 -> 1
// 15 -> 6
// 0 -> 7

const decodeLength = (s: string) =>
  s === "0" ? 7 : 1 + s.charCodeAt(0) - "A".charCodeAt(0);

export const decodeBoard = (code: string) =>
  code.split("").reduce(
    ({ givens, index }, keyPress) => {
      if (keyPress > "0" && keyPress <= "9") {
        return {
          givens: { ...givens, [index]: Number(keyPress) },
          index: index + 1,
        };
      } else {
        return {
          givens,
          index: index + decodeLength(keyPress),
        };
      }
    },
    {
      givens: {} as CellMap,
      index: 0,
    }
  ).givens;

const encodeBlankLength = (n: number): string => {
  let rv = "";
  while (n > 0) {
    rv =
      rv +
      (n > 6 ? "0" : n ? String.fromCharCode("A".charCodeAt(0) + n - 1) : "");
    n -= 7;
  }
  return rv;
};

export const encodeBoard = (
  cellStates: { [key: number]: CellState },
  givens: NumberMap
): string =>
  range(0, 81).reduce(
    ({ blankLength, code }, n) => {
      const { bigNumber } = (givens[n] && cellStates[n]) || {};

      if (bigNumber) {
        return {
          blankLength: 0,
          code: code + encodeBlankLength(blankLength) + bigNumber.toString(),
        };
      } else {
        return {
          blankLength: blankLength + 1,
          code,
        };
      }
    },
    {
      blankLength: 0,
      code: "",
    }
  ).code;
