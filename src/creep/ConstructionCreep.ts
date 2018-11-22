import { log } from '../utils/logger/Log';
import { BaseCreep } from './BaseCreep';


export class ConstructionCreep extends BaseCreep {

    private _mine: Source | undefined;
    private _site: ConstructionSite | null;
    private _building: boolean;

    constructor(creep: Creep, mine?: Source, site?: ConstructionSite) {
        super(creep);

        this._mine = mine || Game.getObjectById(this._creep.memory.mine) as Source;
        this._site = site || Game.getObjectById(this._creep.memory.site) as ConstructionSite;
        this._building = this._creep.memory.building || false;
    }

    public setConstructionSite(site: ConstructionSite): void {
        this._site = site;
        this._creep.memory.site = site.id;
    }

    public get site(): ConstructionSite | null {
        return this._site;
    }

    protected onWork(): void {
        // TODO: Move to pause position if nothing to do
        if (this._building) {
            if (this._site) {
                if (!this._creep.pos.isNearTo(this._site.pos)) {
                    this._creep.moveTo(this._site.pos);
                } else {
                    this._creep.build(this._site);
                    if (this._creep.carry.energy === 0) {
                        this._creep.memory.building = false;
                    }
                }
            } else {
                log.error(`Room: ${this._creep.room.name} | ${this._creep.name} has nothing to do.`);
            }
        } else {
            if (!this._creep.pos.isNearTo(this._mine!.pos)) {
                this._creep.moveTo(this._mine!.pos);
            } else {
                this._creep.harvest(this._mine!);
                if (this._creep.carry.energy >= this._creep.carryCapacity) {
                    this._creep.memory.building = true;
                }
            }
        }
    }
}
