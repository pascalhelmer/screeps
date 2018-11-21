import { BaseCreep } from './BaseCreep';


export class HarvesterCreep extends BaseCreep {

    private _mine: Source | undefined;
    private _depot: Structure | undefined;

    constructor(creep: Creep, mine?: Source, depot?: Structure) {
        super(creep);

        this._mine = mine || Game.getObjectById(this._creep.memory.mine) as Source;
        this._depot = depot || Game.getObjectById(this._creep.memory.depot) as Structure;
    }

    protected onWork(): void {
        if (this._creep.carry.energy >= this._creep.carryCapacity) {
            if (!this._creep.pos.isNearTo(this._depot!.pos)) {
                this._creep.moveTo(this._depot!.pos);
            } else {
                this._creep.transfer(this._depot!, RESOURCE_ENERGY);
            }
        } else {
            if (!this._creep.pos.isNearTo(this._mine!.pos)) {
                this._creep.moveTo(this._mine!.pos);
            } else {
                this._creep.harvest(this._mine!);
            }
        }
    }
}
