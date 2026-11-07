import { Enemy, EnemyAi, EnemyConfig } from '../Enemy';
import { BuzzBlob } from './BuzzBlob';
import { Keese } from './Keese';
import { Moblin, MoblinSword } from './Moblin';
import { Gel, GreenZol, RedZol } from './Zol';

type EnemyClass = new (config: EnemyConfig, x: number, y: number) => Enemy;

const CLASSES: Record<EnemyAi, EnemyClass> = {
  moblin: Moblin,
  moblinSword: MoblinSword,
  redZol: RedZol,
  gel: Gel,
  greenZol: GreenZol,
  keese: Keese,
  buzzBlob: BuzzBlob
};

/** Instantiates the class for `config.ai` (behavior 'custom'), else the generic data-driven Enemy. */
export function createEnemy(config: EnemyConfig, x: number, y: number): Enemy {
  const cls = config.ai ? CLASSES[config.ai] : Enemy;
  return new cls(config, x, y);
}

export { Gel } from './Zol';
