export const GameState = {
  Idle: 'idle',
  Playing: 'playing',
  Dead: 'dead',
} as const;

export type GameStateValue = typeof GameState[keyof typeof GameState];

let _state: GameStateValue = GameState.Idle;
const listeners: Array<(s: GameStateValue) => void> = [];

export function getState(): GameStateValue {
  return _state;
}

export function setState(next: GameStateValue): void {
  if (_state === next) return;
  _state = next;
  listeners.forEach(fn => fn(next));
}

export function onStateChange(fn: (s: GameStateValue) => void): () => void {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
