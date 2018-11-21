import { EventStorage } from './utils/storage/event/EventStorage';
import { EVENTTYPE } from './utils/storage/event/EventType.enum';


export class BaseSpawn {

    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;

        // Send event that we spawned a new creep -> could be used by other functions
        if (this._spawn.memory.spawning) {
            if (this.spawning === null) {
                EventStorage.instance().addEvent(
                    this._spawn.room.name,
                    EVENTTYPE.CREEP_SPAWNED,
                    this._spawn.memory.lastrole
                );
                this._spawn.memory.spawning = false;
            }
        }
    }

    public get name(): string {
        return this._spawn.name;
    }

    public get spawning(): any {
        // TODO: Change return type
        return this._spawn.spawning;
    }

    public spawnCreep(body: BodyPartConstant[], name: string, memory: any): void {
        this._spawn.memory.lastrole = memory.memory.role;
        this._spawn.memory.spawning = true;
        this._spawn.spawnCreep(body, name, memory);
    }
}
