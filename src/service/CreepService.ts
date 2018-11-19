import { BaseCreep } from '../creep/BaseCreep';
import { log } from "../utils/logger/Log";
import { CreepNewPayload } from "../utils/payload/CreepNewPayload";
import { Action } from "../utils/storage/queue/Action";
import { ACTIONPRIO } from "../utils/storage/queue/ActionPrio.enum";
import { ACTIONTYPE } from "../utils/storage/queue/ActionType.enum";
import { QueueStorage } from "../utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "../utils/storage/queue/QueueType.enum";
import { BaseService } from './BaseService';


export abstract class CreepService extends BaseService {

    protected _creeps: BaseCreep[];

    constructor(roomName: string) {
        super(roomName);

        log.debug(`Loading CreepService creeps for ${this._room.name}...`);
        this._creeps = this.loadCreeps().map(value => new BaseCreep(value));
        log.debug(`Room: ${this._room.name} | Creeps: ${this._creeps.length}`);
    }

    protected loadCreeps(): Creep[] {
        log.debug(`Room: ${this._room.name} | Loading creeps with role: ${this._getMemoryKey()}`);
        return _.filter(Game.creeps, { memory: { role: this._getMemoryKey() }});
    }

    public update(): void {
        log.debug(`Room: ${this._room.name} | Updating CreepService...`);
        this._creeps.forEach(creep => creep.update());
    }

    protected birth(body: string[], memory: any): boolean {
        log.debug(`Room: ${this._room.name} | Queueing birth of new creep.`, body);
        const action = new Action(ACTIONPRIO.HIGHEST, ACTIONTYPE.CREEPNEW, new CreepNewPayload(body, this._getMemoryKey(), memory));
        return QueueStorage.instance().enqueue(this._room.name, QUEUETYPE.CREEP, action);
    }

    private _getMemoryKey(): string {
        return this._room.name + this.constructor.name;
    }
}
