import * as _ from 'lodash';
import { CreepNewPayload } from "../utils/payload/CreepNewPayload";
import { ACTIONTYPE } from "../utils/storage/queue/ActionType.enum";
import { QueueStorage } from "../utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "../utils/storage/queue/QueueType.enum";
import { BaseService } from "./BaseService";


export class SpawnService extends BaseService {

    private _room: Room | undefined;
    private _spawns: StructureSpawn[];

    constructor(roomName: string) {
        super(roomName);

        this._room = this.loadRoom();
        this._spawns = this.loadSpawns();
    }

    public update(): void {
        const action = QueueStorage.instance().peek(this._roomName, QUEUETYPE.CREEP);
        if (!action) {
            return;
        }

        switch (action.type) {
            case ACTIONTYPE.CREEPNEW:
                const freeSpawn = this.getNotWorkingSpawn();
                if (freeSpawn) {
                    const payload = (action.payload as CreepNewPayload);
                    if (this.couldSpawn(payload.body)) {
                        QueueStorage.instance().dequeue(this._roomName, QUEUETYPE.CREEP);
                        // TODO: Add name generator
                        freeSpawn.spawnCreep(payload.body as BodyPartConstant[], '', { memory: payload.memory as CreepMemory })
                    }
                }
                break;
        }
    }

    private couldSpawn(body: string[]): boolean {
        let cost = 0;
        body.forEach(bodypart => cost += BODYPART_COST[bodypart]);

        if (this._room.energyAvailable >= cost) {
            return true;
        }
        return false;
    }

    private getNotWorkingSpawn(): StructureSpawn | undefined {
        const freeSpawns: StructureSpawn[] = _.filter(this._spawns, { spawning: null });
        if (freeSpawns.length > 0) {
            return freeSpawns[0];
        }
        return undefined;
    }

    private loadRoom(): Room | undefined {
        const rooms: Room[] = _.filter(Game.rooms, { name: this._roomName });
        if (rooms.length > 0) {
            return rooms[0];
        }
        // TODO: Throw error -> there have to be an room
        return undefined;
    }

    private loadSpawns(): StructureSpawn[] {
        if (this._room) {
            return this._room.find(FIND_MY_SPAWNS);
        }
        return [];
    }
}
