import { log } from "../utils/logger/Log";
import { RoadNewPayload } from "../utils/payload/RoadNewPayload";
import { ACTIONTYPE } from "../utils/storage/queue/ActionType.enum";
import { QueueStorage } from "../utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "../utils/storage/queue/QueueType.enum";
import { BaseService } from "./BaseService";


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

export class ConstructionService extends BaseService {
    private _memory: ConstructionMemory;
    private _currentJob: RoadNewPayload | undefined;

    constructor(roomName: string) {
        super(roomName);

        if (!this._room.memory.construction) {
            this._room.memory.construction = {} as ConstructionMemory;
        }
        this._memory = this._room.memory.construction;

        if (this._memory.currentJob) {
            this._currentJob = RoadNewPayload.deserialize(this._memory.currentJob);
        }
    }

    public update(): void {
        log.debug(`Room: ${this._room.name} | Updating ConstructionService...`);

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

            // TODO: Assign unassigned builders to construction sites
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
