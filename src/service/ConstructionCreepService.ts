import { ConstructionCreep } from "../creep/ConstructionCreep";
import { DockableSource } from "../utils/analyzer/DockableSource.interface";
import { RoomAnalyzer } from "../utils/analyzer/RoomAnalyzer";
import { log } from "../utils/logger/Log";
import { RoadNewPayload } from "../utils/payload/RoadNewPayload";
import { EventStorage } from "../utils/storage/event/EventStorage";
import { EVENTTYPE } from "../utils/storage/event/EventType.enum";
import { ACTIONTYPE } from "../utils/storage/queue/ActionType.enum";
import { QueueStorage } from "../utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "../utils/storage/queue/QueueType.enum";
import { CreepService } from "./CreepService";


export interface ConstructionMemory {
    [name: string]: any;
}

export interface Path {
    x: number;
    y: number;
    dx: number;
    dy: number;
    direction: number;
}

export class ConstructionCreepService extends CreepService {
    private _memory: ConstructionMemory;
    private _currentJob: RoadNewPayload | undefined;
    private _roomAnalyzer: RoomAnalyzer;

    constructor(roomName: string) {
        super(roomName);

        // TODO: Handle loading of creeps better; Currently they got loaded two times. First time in CreepService.
        log.debug(`Loading ConstructionCreepService creeps for ${this._room.name}...`);
        this._creeps = this.loadCreeps().map(value => new ConstructionCreep(value));
        log.debug(`Room: ${this._room.name} | Creeps: ${this._creeps.length}`);

        this._roomAnalyzer = new RoomAnalyzer(this._room);

        if (!this._room.memory.construction) {
            this._room.memory.construction = {} as ConstructionMemory;
        }
        this._memory = this._room.memory.construction;

        if (this._memory.currentJob) {
            this._currentJob = RoadNewPayload.deserialize(this._memory.currentJob);
        }
    }

    public update(): void {
        log.debug(`Room: ${this._room.name} | Updating ConstructionCreepService...`);

        this.birth();

        // Check if we currently construct on anything
        if (this._currentJob) {
            if (this._memory.new) {
                // Create construction sites
                const roadPath: Path[] = this._room.findPath(this._currentJob.from, this._currentJob.dest, {
                    ignoreCreeps: true,
                    maxRooms: 1,
                    range: 1
                });

                roadPath.forEach((value: Path) => {
                    this._room.createConstructionSite(value.x, value.y, STRUCTURE_ROAD);
                });
                this._memory.new = false;
            }

            const conSites: ConstructionSite[] = this._room.find(FIND_CONSTRUCTION_SITES);

            // TODO: Assign unassigned constructors to construction sites
            const sites = this._room.find(FIND_CONSTRUCTION_SITES);
            if (sites.length > 0) {
                const unassignedConstructors = _.filter(this._creeps, (creep: ConstructionCreep) => {
                    const site = creep.site;
                    if (site !== null) {
                        if (Game.getObjectById(site.id) !== null) {
                            return false;
                        }
                    }
                    return true;
                });
                log.debug(`Room: ${this._room.name} | Unassigned constructors: ${unassignedConstructors.length}`);
                unassignedConstructors.forEach((creep) => {
                    // TODO: Find better solution to select construction site
                    (creep as ConstructionCreep).setConstructionSite(sites[0]);
                });
            } else {
                log.debug(`Room: ${this._room.name} | Job completed.`);
                this._memory.currentJob = undefined;
            }

            super.update();
        } else {
            // Select new construction job
            const action = QueueStorage.instance().peek(this._room.name, QUEUETYPE.CONSTRUCTION);
            if (!action) {
                return;
            }

            switch (action.type) {
                case ACTIONTYPE.ROADNEW:
                    log.debug(`Room: ${this._room.name} | New build road action found.`);
                    this._currentJob = QueueStorage.instance().dequeue(this._room.name, QUEUETYPE.CONSTRUCTION)!.payload as RoadNewPayload;
                    break;
            }

            if (this._currentJob) {
                this._memory.currentJob = RoadNewPayload.serialize(this._currentJob);
                this._memory.new = true;
            }
        }
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
            const currentAssignedConstructor: number = _.filter(
                Game.creeps,
                { memory: { role: this._getMemoryKey(), mine: value.id }}
            ).length;
            log.debug('curAssignedConstructor: ', currentAssignedConstructor);
            log.debug('dockable: ', value.dockable);
            // TODO: Calculate Construction Creep number based on construction sites?
            if (currentAssignedConstructor < 2) {
                shouldBirth = true;
                source = value.id;
                return true;
            }
            return false;
        });

        // Birth new harvester
        if (shouldBirth) {
            log.debug(`Room: ${this._room.name} | Birth new construction creep...`);
            // TODO: Calculate body
            log.debug(`Room: ${this._room.name} | Calculating new body for constructor...`);
            // TODO: Get storage depot as destination for this new constructor
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

/*
var roleBuilder = {
    run: function(creep) {
        if (Memory.constructionExists) {
            if(creep.memory.building && creep.carry.energy == 0) {
                creep.memory.building = false;
            }
            if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
                creep.memory.building = true;
            }

            if(creep.memory.building) {
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length > 0) {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { reusePath: Memory.reusePath, visualizePathStyle: {stroke: Memory.pathColor[Memory.builder]}});
                    }
                }
            }
            else {
                if (Memory.containerExists) {
                    var sources = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_CONTAINER) && structure.store[RESOURCE_ENERGY] >= creep.carryCapacity}});
                    if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], { reusePath: Memory.reusePath, visualizePathStyle: {stroke: Memory.pathColor[Memory.builder]}});
                    }
                } else {
                    var sources = creep.room.find(FIND_SOURCES);
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], { reusePath: Memory.reusePath, visualizePathStyle: {stroke: Memory.pathColor[Memory.builder]}});
                    }
                }
            }
        } else {
            var spawner = creep.room.find(FIND_STRUCTURES, {filter: (structure) => {return (structure.structureType == STRUCTURE_SPAWN)}});
            if (spawner[0].recycleCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawner[0], { reusePath: Memory.reusePath, visualizePathStyle: {stroke: Memory.pathColor[Memory.builder]}});
            }
        }

    }
}

module.exports = roleBuilder;
*/
