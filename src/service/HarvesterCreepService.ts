import { BaseCreep } from "../creep/BaseCreep";
import { HarvesterCreep } from "../creep/HarvesterCreep";
import { DockableSource } from "../utils/analyzer/DockableSource.interface";
import { RoomAnalyzer } from '../utils/analyzer/RoomAnalyzer';
import { log } from '../utils/logger/Log';
import { EventStorage } from "../utils/storage/event/EventStorage";
import { EVENTTYPE } from "../utils/storage/event/EventType.enum";
import { CreepService } from './CreepService';


export interface HarvesterMemory {
    [name: string]: any;
}

export class HarvesterCreepService extends CreepService {

    private _memory: HarvesterMemory;
    private _roomAnalyzer: RoomAnalyzer;

    constructor(roomName: string) {
        super(roomName);

        // TODO: Handle loading of creeps better; Currently they got loaded two times. First time in CreepService.
        log.debug(`Loading HarvesterCreepService creeps for ${this._room.name}...`);
        this._creeps = this.loadCreeps().map(value => new HarvesterCreep(value));
        log.debug(`Room: ${this._room.name} | Creeps: ${this._creeps.length}`);

        this._roomAnalyzer = new RoomAnalyzer(this._room);

        if (!this._room.memory.harvester) {
            this._room.memory.harvester = {};
        }
        this._memory = this._room.memory.harvester;
    }

    public update(): void {
        this.birth();

        super.update();
    }

    protected birth(): boolean {
        // Prevent multiple harvester to get queued
        if (this._memory.currentBirthing) {
            // Check if our new creep got spawned
            const events = EventStorage.instance().getEvents(
                this._room.name,
                EVENTTYPE.CREEP_SPAWNED,
                this._getMemoryKey(),
                true
            );

            if (events.length === 0) {
                return false;
            }
            this._memory.currentBirthing = false;
        }

        // Calculate if we need a new harvester
        let shouldBirth = false;
        let source;
        const dockableSources: DockableSource[] = this._roomAnalyzer.findSources();
        dockableSources.some((value: DockableSource) => {
            log.debug('Source ID: ', value.id);
            const currentAssignedHarvester: number = _.filter(Game.creeps, { memory: { mine: value.id }}).length;
            log.debug('curAssignedHarvester: ', currentAssignedHarvester);
            log.debug('dockable: ', value.dockable);
            if (currentAssignedHarvester < value.dockable) {
                shouldBirth = true;
                source = value.id;
                return true;
            }
            return false;
        });

        // Birth new harvester
        if (shouldBirth) {
            log.debug(`Room: ${this._room.name} | Birth new harvester creep...`);
            // TODO: Calculate body
            log.debug(`Room: ${this._room.name} | Calculating new body for harvester...`);
            // TODO: Get storage depot as destination for this new harvester
            const birthing: boolean = super.birth(
                [WORK, CARRY, MOVE, MOVE],
                { mine: source, depot: this._room.find(FIND_MY_SPAWNS)[0].id }
            );
            this._memory.currentBirthing = birthing;
            return birthing;
        }
        return false;
    }
}
