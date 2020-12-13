import { range } from "lodash";
import React, {
  FC,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { Observer, Observable } from "rxjs";
import { calculateCellData, Cell, divd } from "./Cell";
import { decodeBoard } from "./Coder";
import "./Game.css";
import {
  CellMap,
  CellState,
  GameState,
  KeyDown,
  GameBoard,
  NumberMap,
  Move,
  BlankCellState,
  CellData,
  GameSettings,
} from "./GameTypes";
import { useSubscribe } from "./hooks";
import { Legend } from "./Legend";

const InitGameState: GameState = {
  board: {
    cellStates: {},
    rows: {},
    columns: {},
    boxes: {},
    givens: {},
  },
  gameSettings: {
    keyMeaning: "big",
    draftMode: false,
  },
};

const getKeyCode = (s: string): number | undefined => {
  if (s === " ") {
    return 0;
  }
  const n = Number(s);
  if (Number.isNaN(n)) {
    return undefined;
  }
  return n;
};

const handleKeyCode = (
  keyCode: number,
  cellData: CellData,
  gameSettings: GameSettings,
  board: GameBoard
): GameBoard => {
  const { keyMeaning } = gameSettings;
  const { bigNumber, snyder, center } =
    board.cellStates[cellData.numberInGame] || BlankCellState;

  const extendRS = (before: NumberMap, meaning: string) =>
    keyMeaning === meaning
      ? keyCode === 0
        ? {}
        : { ...before, [keyCode]: !before[keyCode] }
      : before;

  const newCellState: CellState = {
    bigNumber: keyMeaning === "big" ? keyCode : bigNumber,
    snyder: extendRS(snyder, "snyder"),
    center: extendRS(center, "center"),
  };

  const cellStates = {
    ...board.cellStates,
    [cellData.numberInGame]: newCellState,
  };
  const extendGS = (before: { [k: number]: CellMap }, x: number, y: number) =>
    keyMeaning === "big"
      ? { ...before, [x]: { ...before[x], [y]: keyCode } }
      : before;

  const givens = gameSettings.draftMode
    ? { ...board.givens, [cellData.numberInGame]: !!keyCode }
    : board.givens;

  return {
    cellStates,
    rows: extendGS(board.rows, cellData.row, cellData.column),
    columns: extendGS(board.columns, cellData.column, cellData.row),
    boxes: extendGS(board.boxes, cellData.box, cellData.numberInBox),
    givens,
  };
};

const getInitialState = (code: string): GameState => {
  const givens = decodeBoard(code);
  const gameSettings = { keyMeaning: "big", draftMode: true } as GameSettings;
  const board = Object.entries(givens).reduce(
    (board, [n, keyCode]) =>
      handleKeyCode(
        keyCode,
        calculateCellData(divd(Number(n), 9), Number(n) % 9),
        gameSettings,
        board
      ),
    InitGameState.board
  );
  return { gameSettings: InitGameState.gameSettings, board };
};

const adjustBoard = (gameState: GameState, move: KeyDown): GameBoard => {
  const { key, cellData } = move;
  const keyCode = getKeyCode(key);
  if (keyCode === undefined) {
    return gameState.board;
  }
  if (
    !gameState.gameSettings.draftMode &&
    gameState.board.givens[cellData.numberInGame]
  ) {
    // cannot change givens!
    return gameState.board;
  }
  return handleKeyCode(
    keyCode,
    cellData,
    gameState.gameSettings,
    gameState.board
  );
};

const GameTable: FC<{
  gameState: GameState;
  onKeyPress: (m: KeyDown) => void;
}> = ({ gameState, onKeyPress }) => {
  return (
    <table id="gameTable">
      <tbody>
        {range(0, 9).map((row) => (
          <tr key={row}>
            {range(0, 9).map((column) => (
              <Cell
                key={`${row}-${column}`}
                row={row}
                column={column}
                gameState={gameState}
                onKeyPress={onKeyPress}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const Game: FC<{
  toPartner?: Observer<string>;
  fromPartner?: Observable<string>;
  connected?: boolean;
  code?: string;
}> = ({ fromPartner, toPartner, connected, code }) => {
  const reducer: Reducer<GameState, Move> = useCallback(
    (gameState: GameState, move: Move): GameState => {
      if (move.type === "keydown") {
        const board = adjustBoard(gameState, move);
        toPartner?.next(JSON.stringify(board));
        lastBoard.current = board;
        return {
          ...gameState,
          board,
        };
      } else if (move.type === "changesetting") {
        return { ...gameState, gameSettings: move.gameSettings };
      } else if (move.type === "updateboard") {
        return { ...gameState, board: move.board };
      } else if (move.type === "init") {
        return getInitialState(move.code);
      }
      return gameState;
    },
    [toPartner]
  );
  const [gameState, dispatch] = useReducer(reducer, InitGameState);
  useEffect(() => {
    dispatch({ type: "init", code: code || "" });
  }, [code]);
  const lastBoard = useRef(gameState.board);
  const subscriber = useCallback(
    (s: string) => {
      dispatch({ type: "updateboard", board: JSON.parse(s) });
    },
    [dispatch]
  );
  useSubscribe(fromPartner, subscriber);
  useEffect(() => {
    if (connected) {
      setTimeout(() => {
        toPartner?.next(JSON.stringify(lastBoard.current));
      }, 2000);
    }
  }, [connected, toPartner]);
  return (
    <div
      style={{
        display: "flex",
        alignContent: "center",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <GameTable gameState={gameState} onKeyPress={dispatch} />
      <Legend gameState={gameState} onGameSettingChange={dispatch} />
    </div>
  );
};
