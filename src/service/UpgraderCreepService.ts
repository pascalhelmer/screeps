import { UpgraderCreep } from '../creep/UpgraderCreep';
import { DockableSource } from '../utils/analyzer/DockableSource.interface';
import { RoomAnalyzer } from '../utils/analyzer/RoomAnalyzer';
import { log } from '../utils/logger/Log';
import { EventStorage } from "../utils/storage/event/EventStorage";
import { EVENTTYPE } from '../utils/storage/event/EventType.enum';
import { CreepService } from './CreepService';


export interface UpgraderMemory {
    [name: string]: any;
}

export class UpgraderCreepService extends CreepService {

    private _memory: UpgraderMemory;
    private _roomAnalyzer: RoomAnalyzer;

    constructor(roomName: string) {
        super(roomName);

        // TODO: Handle loading of creeps better; Currently they got loaded two times. First time in CreepService.
        log.debug(`Loading UpgraderCreepService creeps for ${this._room.name}...`);
        this._creeps = this.loadCreeps().map(value => new UpgraderCreep(value));
        log.debug(`Room: ${this._room.name} | Creeps: ${this._creeps.length}`);

        this._roomAnalyzer = new RoomAnalyzer(this._room);

        if (!this._room.memory.upgrader) {
            this._room.memory.upgrader = {};
        }
        this._memory = this._room.memory.upgrader;
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

        // Calculate if we need a new upgrader
        let shouldBirth = false;
        let source;
        const dockableSources: DockableSource[] = this._roomAnalyzer.findSources();
        dockableSources.some((value: DockableSource) => {
            log.debug('Source ID: ', value.id);
            const currentAssignedUpgrader: number = _.filter(
                Game.creeps,
                { memory: { role: this._getMemoryKey(), mine: value.id }}
            ).length;
            log.debug('curAssignedUpgrader: ', currentAssignedUpgrader);
            log.debug('dockable: ', value.dockable);
            // TODO: Calculate Upgrader number based on Controller level? Count of Harvester?
            if (currentAssignedUpgrader < 2) {
                shouldBirth = true;
                source = value.id;
                return true;
            }
            return false;
        });

        // Birth new harvester
        if (shouldBirth) {
            log.debug(`Room: ${this._room.name} | Birth new upgrader creep...`);
            // TODO: Calculate body
            log.debug(`Room: ${this._room.name} | Calculating new body for upgrader...`);
            const birthing: boolean = super.birth(
                [WORK, CARRY, MOVE, MOVE],
                { mine: source }
            );
            this._memory.currentBirthing = birthing;
            return birthing;
        }
        return false;
    }
}
