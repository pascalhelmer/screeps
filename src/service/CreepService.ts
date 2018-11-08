import { BaseCreep } from '../creep/BaseCreep';
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

        this._creeps = this.load();
    }

    private load(): BaseCreep[] {
        return _.filter(Game.creeps, { memory: { role: this._getMemoryKey() }}).map(value => new BaseCreep(value));
    }

    public update(): void {
        this._creeps.forEach(creep => creep.update());
    }

    protected birth(body: string[], memory: Memory): void {
        const action = new Action(ACTIONPRIO.HIGHEST, ACTIONTYPE.CREEPNEW, new CreepNewPayload(body, this._getMemoryKey(), memory));
        QueueStorage.instance().enqueue(this._roomName, QUEUETYPE.CREEP, action);
    }

    private _getMemoryKey(): string {
        return this._roomName + this.constructor.name;
    }
}
