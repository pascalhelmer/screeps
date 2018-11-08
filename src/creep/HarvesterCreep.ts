import { BaseCreep } from './BaseCreep';


export class HarvesterCreep extends BaseCreep {

    private _mine: Mineral | undefined;
    private _depot: Structure | undefined;

    constructor(creep: Creep, mine?: Mineral, depot?: Structure) {
        super(creep);

        this._mine = mine || this._creep.memory._mine;
        this._depot = depot || this._creep.memory._depot;
    }

    protected load(): void {
        super.load();
        this._mine = Object.assign(new Mineral(''), this._creep.memory._mine);
        this._depot = Object.assign(new Structure(''), this._creep.memory._depot);
    }

    public setMiningRoute(mine: Mineral, depot: Structure): void {
        this._mine = mine;
        this._depot = depot;
    }

    protected onWork(): void {
        if (this._creep.carry.energy >= this._creep.carryCapacity) {
            if (!this._creep.pos.isNearTo(this._depot.pos)) {
                this._creep.moveTo(this._depot.pos);
            } else {
                this._creep.transfer(this._depot, this._mine.mineralType);
            }
        } else {
            if (!this._creep.pos.isNearTo(this._mine.pos)) {
                this._creep.moveTo(this._mine.pos);
            } else {
                this._creep.harvest(this._mine);
            }
        }
    }
}
