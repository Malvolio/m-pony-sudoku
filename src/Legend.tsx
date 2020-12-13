import { FC } from "react";
import { encodeBoard } from "./Coder";
import { GameState, ChangeSetting } from "./GameTypes";
const Coder: FC<{
  gameState: GameState;
}> = ({ gameState }) => {
  return (
    <div>
      {gameState.gameSettings.draftMode &&
        encodeBoard(gameState.board.cellStates, gameState.board.givens)}
    </div>
  );
};
export const Legend: FC<{
  gameState: GameState;
  onGameSettingChange: (m: ChangeSetting) => void;
}> = ({ gameState, onGameSettingChange }) => {
  const Radio: FC<{
    label: string;
    keyMeaning: typeof gameState.gameSettings.keyMeaning;
    disabled: boolean;
  }> = ({ label, keyMeaning, disabled }) => (
    <label style={{ display: "flex", alignContent: "start" }}>
      <input
        style={{ marginRight: 5 }}
        type="radio"
        name="km"
        value={keyMeaning}
        disabled={disabled}
        checked={gameState.gameSettings.keyMeaning === keyMeaning}
        onChange={() =>
          onGameSettingChange({
            type: "changesetting",
            gameSettings: { ...gameState.gameSettings, keyMeaning },
          })
        }
      />
      {label}
    </label>
  );

  return (
    <div
      style={{
        width: 200,
        border: "thin solid gray",
        padding: 10,
        margin: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
      }}
    >
      <Radio
        keyMeaning="big"
        label="Big"
        disabled={gameState.gameSettings.draftMode}
      />
      <Radio
        keyMeaning="center"
        label="Center"
        disabled={gameState.gameSettings.draftMode}
      />
      <Radio
        keyMeaning="snyder"
        label="Snyder"
        disabled={gameState.gameSettings.draftMode}
      />
      <label
        style={{
          borderTop: "thin solid lightgray",
          paddingTop: 5,
          marginTop: 5,
        }}
      >
        <input
          style={{ marginRight: 5 }}
          type="checkbox"
          checked={gameState.gameSettings.draftMode}
          onChange={(e) => {
            const draftMode = e.currentTarget.checked;
            onGameSettingChange({
              type: "changesetting",
              gameSettings: {
                ...gameState.gameSettings,
                keyMeaning: "big",
                draftMode,
              },
            });
          }}
        />
        Draft Mode
      </label>
      <Coder gameState={gameState} />
    </div>
  );
};
