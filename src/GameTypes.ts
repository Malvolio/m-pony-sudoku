export type GameSettings = {
  keyMeaning: "big" | "center" | "snyder";
  draftMode: boolean;
};
export type CellData = {
  row: number;
  column: number;
  classNames: string;
  box: number;
  numberInBox: number;
  numberInGame: number;
};
export type NumberMap = { [key: number]: boolean };
export type CellMap = { [key: number]: number };

export type CellState = {
  bigNumber: number;
  snyder: NumberMap;
  center: NumberMap;
};
export type GameBoard = {
  cellStates: { [key: number]: CellState };
  rows: { [k: number]: CellMap };
  columns: { [k: number]: CellMap };
  boxes: { [k: number]: CellMap };
  givens: NumberMap;
};
export type GameState = {
  board: GameBoard;
  gameSettings: GameSettings;
};

export type KeyDown = { type: "keydown"; key: string; cellData: CellData };
export type ChangeSetting = {
  type: "changesetting";
  gameSettings: GameSettings;
};
type UpdateBoard = {
  type: "updateboard";
  board: GameBoard;
};
type Init = {
  type: "init";
  code: string;
};

export type Move = KeyDown | ChangeSetting | UpdateBoard | Init;

export const BlankNumbers = {};

export const BlankCellState: CellState = {
  bigNumber: 0,
  snyder: BlankNumbers,
  center: BlankNumbers,
};
