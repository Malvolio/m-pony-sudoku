import { max, range } from "lodash";
import { FC, useCallback, useMemo } from "react";
import "./Game.css";
import {
  CellMap,
  GameState,
  KeyDown,
  CellData,
  BlankCellState,
} from "./GameTypes";

export const divd = (dividend: number, divisor: number) =>
  ~~(dividend / divisor);

export const calculateCellData = (row: number, column: number): CellData => {
  const classNames = [
    "cellTd",
    row % 3 === 0 && "t",
    column % 3 === 0 && "l",
    column === 8 && "r",
    row === 8 && "b",
  ]
    .filter(Boolean)
    .join(" ");

  const box = divd(column, 3) + 3 * divd(row, 3);
  const numberInBox = (column % 3) + 3 * (row % 3);
  const numberInGame = column + 9 * row;
  return {
    row,
    column,
    classNames,
    box,
    numberInBox,
    numberInGame,
  };
};

const dumpNumbers = (
  v: { [k: number]: boolean },
  paddingRight: number,
  isRed: (n: number) => number
) =>
  range(0, 10).map((n) =>
    v[n] ? (
      <span
        key={n}
        style={{ paddingRight, color: isRed(n) > 0 ? "red" : "black" }}
      >
        {n}
      </span>
    ) : null
  );
const countOf = (v: { [k: number]: CellMap }, index: number, comp: number) => {
  const w = v[index] || {};
  return range(0, 10).filter((n) => w[n] === comp).length;
};

export const Cell: FC<{
  row: number;
  column: number;
  gameState: GameState;
  onKeyPress: (m: KeyDown) => void;
}> = ({ row, column, gameState, onKeyPress }) => {
  const cellData = useMemo(() => calculateCellData(row, column), [column, row]);
  const { bigNumber, snyder, center } =
    gameState.board.cellStates[cellData.numberInGame] || BlankCellState;
  const redCount = useCallback(
    (n: number) =>
      n &&
      (max([
        countOf(gameState.board.boxes, cellData.box, n),
        countOf(gameState.board.rows, cellData.row, n),
        countOf(gameState.board.columns, cellData.column, n),
      ]) ||
        0),
    [cellData, gameState.board]
  );

  const doKeyPress = useCallback(
    (e: React.KeyboardEvent<unknown>) => {
      onKeyPress({ type: "keydown", key: e.key, cellData });
    },
    [cellData, onKeyPress]
  );
  const isGiven = gameState.board.givens[cellData.numberInGame];
  return (
    <td
      className={cellData.classNames}
      onKeyPress={doKeyPress}
      tabIndex={cellData.numberInGame + 1}
    >
      {!!bigNumber && (
        <div
          className="bigNumber"
          style={{
            color: redCount(bigNumber) > 1 ? "red" : isGiven ? "blue" : "black",
          }}
        >
          {bigNumber}
        </div>
      )}
      {!bigNumber && !gameState.gameSettings.draftMode && (
        <div className="centerNumbers">{dumpNumbers(center, 1, redCount)}</div>
      )}
      {!bigNumber && !gameState.gameSettings.draftMode && (
        <div className="snyderNumbers">{dumpNumbers(snyder, 3, redCount)}</div>
      )}
    </td>
  );
};
