export type Coordinate = [number, number];

export function toCoordinate(columns: number, index: number): Coordinate {
  const row = Math.floor(index / columns);
  const col = index % columns;
  return [row, col];
}

export function toIndex(columns: number, [row, col]: Coordinate): number {
  return row * columns + col;
}
