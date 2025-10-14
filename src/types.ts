export type Faction = 'player' | 'ai' | 'neutral';

export interface NodeDefinition {
  id: string;
  x: number;
  y: number;
  owner: Faction;
  energy: number;
  capacity: number;
  regen: number;
  radius: number;
}

export interface LevelDefinition {
  id: string;
  width: number;
  height: number;
  nodes: NodeDefinition[];
  seed: number;
}

export interface NodeState extends NodeDefinition {
  outgoingLimit: number;
  safetyReserve: number;
  energy: number;
  owner: Faction;
}

export interface LinkState {
  id: string;
  sourceId: string;
  targetId: string;
  share: number;
  length: number;
  efficiency: number;
  owner: Faction;
  maxRate: number;
  smoothedRate: number;
}

export interface GameConfig {
  fixedStep: number;
  maxLinkDistance: number;
  distanceLoss: number;
  efficiencyFloor: number;
  captureSeed: number;
  safetyReserve: number;
  outgoingLimit: number;
  linkMaxRate: number;
  surplusThreshold: number;
  sharePresets: Record<string, number>;
}
