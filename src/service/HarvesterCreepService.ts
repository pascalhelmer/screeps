import { Action } from "../utils/queue-storage/Action";
import { ACTIONPRIO } from "../utils/queue-storage/ActionPrio.enum";
import { ACTIONTYPE } from "../utils/queue-storage/ActionType.enum";
import { QueueStorage } from "../utils/queue-storage/QueueStorage";
import { QUEUETYPE } from "../utils/queue-storage/QueueType.enum";
import { CreepService } from './CreepService';


export class HarvesterCreepService extends CreepService {

    private _roomid: string;

    constructor(roomid: string) {
        super();

        this._roomid = roomid;
    }

    private load(): void {
        // TODO: Load from memory --> this.creeps = [ new HarvesterCreep() ]
    }

    private birth(): void {
        const newHarvesterAction = new Action(ACTIONPRIO.HIGHEST, ACTIONTYPE.CREEPNEW, { body: [] });
        QueueStorage.instance().enqueue(this._roomid, QUEUETYPE.CREEP, newHarvesterAction);
    }
}
