import { log } from '../utils/logger/Log';
import { BaseCreep } from './BaseCreep';


export class UpgraderCreep extends BaseCreep {

    private _mine: Source | undefined;
    private _upgrading: boolean;

    constructor(creep: Creep, mine?: Source) {
        super(creep);

        this._mine = mine || Game.getObjectById(this._creep.memory.mine) as Source;
        this._upgrading = this._creep.memory.upgrading || false;
    }

    protected onWork(): void {
        if (this._upgrading) {
            const controller = this._creep.room.controller;
            if (controller) {
                if (!this._creep.pos.isNearTo(controller.pos)) {
                    this._creep.moveTo(controller.pos);
                } else {
                    this._creep.upgradeController(controller);
                    if (this._creep.carry.energy === 0) {
                        this._creep.memory.upgrading = false;
                    }
                }
            } else {
                log.error(`Room: ${this._creep.room.name} | ${this._creep.name} failed to find controller of this room.`);
            }
        } else {
            if (!this._creep.pos.isNearTo(this._mine!.pos)) {
                this._creep.moveTo(this._mine!.pos);
            } else {
                this._creep.harvest(this._mine!);
                if (this._creep.carry.energy >= this._creep.carryCapacity) {
                    this._creep.memory.upgrading = true;
                }
            }
        }
    }
}
