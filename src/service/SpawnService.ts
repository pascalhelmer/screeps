import { log } from "../utils/logger/Log";
import { CreepNewPayload } from "../utils/payload/CreepNewPayload";
import { ACTIONTYPE } from "../utils/storage/queue/ActionType.enum";
import { QueueStorage } from "../utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "../utils/storage/queue/QueueType.enum";
import { BaseService } from "./BaseService";


export class SpawnService extends BaseService {

    private _spawns: StructureSpawn[];

    constructor(roomName: string) {
        super(roomName);

        log.debug(`Init SpawnService for room ${roomName}...`);
        this._spawns = this.loadSpawns();
        log.debug(`Room: ${this._room.name} | Spawns: ${this._spawns.length}`);
    }

    public update(): void {
        log.debug(`Room: ${this._room.name} | Updating SpawnService...`);
        const action = QueueStorage.instance().peek(this._room.name, QUEUETYPE.CREEP);
        if (!action) {
            return;
        }

        switch (action.type) {
            case ACTIONTYPE.CREEPNEW:
                log.debug(`Room: ${this._room.name} | New creeep spawn action found.`);
                const freeSpawn = this.getNotWorkingSpawn();
                if (freeSpawn) {
                    const payload = (action.payload as CreepNewPayload);
                    if (this.couldSpawn(payload.body)) {
                        log.debug(`Room: ${this._room.name} | Spawn new creep in free spawn: ${freeSpawn.name}`);
                        QueueStorage.instance().dequeue(this._room.name, QUEUETYPE.CREEP);
                        // TODO: Add name generator
                        freeSpawn.spawnCreep(payload.body as BodyPartConstant[], `${Game.time}`, { memory: payload.memory as CreepMemory })
                    }
                }
                break;
        }
    }

    private couldSpawn(body: string[]): boolean {
        log.debug(`Room: ${this._room.name} | Check if we could spawn new creep...`, body);
        let cost = 0;
        body.forEach(bodyPart => {
            switch (bodyPart) {
                case WORK:
                    cost += BODYPART_COST.work;
                    break;
                case CARRY:
                    cost += BODYPART_COST.carry;
                    break;
                case MOVE:
                    cost += BODYPART_COST.move;
                    break;
                case ATTACK:
                    cost += BODYPART_COST.attack;
                    break;
                case RANGED_ATTACK:
                    cost += BODYPART_COST.ranged_attack;
                    break;
                case TOUGH:
                    cost += BODYPART_COST.tough;
                    break;
                case HEAL:
                    cost += BODYPART_COST.heal;
                    break;
                case CLAIM:
                    cost += BODYPART_COST.claim;
                    break;
            }
        });

        if (this._room) {
            // TODO: Check if we could spawn in another near room
            log.debug(`Room: ${this._room.name} | Cost for new creep: ${cost}; Energy available: ${this._room.energyAvailable}`);
            if (this._room.energyAvailable >= cost) {
                return true;
            }
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

    private loadSpawns(): StructureSpawn[] {
        if (this._room) {
            return this._room.find(FIND_MY_SPAWNS);
        }
        return [];
    }
}
