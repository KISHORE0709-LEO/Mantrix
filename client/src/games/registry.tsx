import type { GameComponent } from './types';
import { LoopArena } from './LoopArena';
import { RecursionMaze } from './RecursionMaze';
import { SortingConveyor } from './SortingConveyor';
import { PatternBuilder } from './PatternBuilder';
import { SearchChallenge } from './SearchChallenge';
import { BacktrackingPuzzle } from './BacktrackingPuzzle';
import { MarkupForge } from './MarkupForge';
import { StyleSpectrum } from './StyleSpectrum';
import { ScriptCircuit } from './ScriptCircuit';
import { ComponentLink } from './ComponentLink';
import { ServiceRunner } from './ServiceRunner';
import { DataBridge } from './DataBridge';
import { DeployOrbit } from './DeployOrbit';

type GameType = 'loop-arena' | 'recursion-maze' | 'sorting-conveyor' | 'pattern-builder' | 'search-challenge' | 'backtracking-puzzle' | 'markup-forge' | 'style-spectrum' | 'script-circuit' | 'component-link' | 'service-runner' | 'data-bridge' | 'deploy-orbit';

export const gameRegistry: Record<GameType, GameComponent> = {
  'loop-arena': LoopArena,
  'recursion-maze': RecursionMaze,
  'sorting-conveyor': SortingConveyor,
  'pattern-builder': PatternBuilder,
  'search-challenge': SearchChallenge,
  'backtracking-puzzle': BacktrackingPuzzle,
  'markup-forge': MarkupForge,
  'style-spectrum': StyleSpectrum,
  'script-circuit': ScriptCircuit,
  'component-link': ComponentLink,
  'service-runner': ServiceRunner,
  'data-bridge': DataBridge,
  'deploy-orbit': DeployOrbit,
};

export function getGameComponent(gameType: GameType): GameComponent | null {
  return gameRegistry[gameType] || null;
}
