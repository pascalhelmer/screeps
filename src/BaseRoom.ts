import { BaseService } from './service/BaseService';
import { ConstructionCreepService } from "./service/ConstructionCreepService";
import { HarvesterCreepService } from './service/HarvesterCreepService';
import { SpawnService } from './service/SpawnService';
import { UpgraderCreepService } from "./service/UpgraderCreepService";
import { SERVICE_TYPE } from './ServiceType.enum';
import { log } from './utils/logger/Log';
import { RoomAnalyzer } from './utils/analyzer/RoomAnalyzer';
import { RoadNewPayload } from "./utils/payload/RoadNewPayload";
import { Action } from "./utils/storage/queue/Action";
import { ACTIONPRIO } from "./utils/storage/queue/ActionPrio.enum";
import { ACTIONTYPE } from "./utils/storage/queue/ActionType.enum";
import { QueueStorage } from "./utils/storage/queue/QueueStorage";
import { QUEUETYPE } from "./utils/storage/queue/QueueType.enum";


export class BaseRoom {

    private _room: Room;
    private _services: BaseService[];
    private _analyzer: RoomAnalyzer;

    constructor(room: Room) {
        this._room = room;
        this._services = [];
        this._analyzer = new RoomAnalyzer(room);
    }

    public load(): void {
        this._services = this.loadServices();
    }

    public save(): void {
        this.saveServices();
    }

    public update(): void {
        this.analyse();

        if (!this._room.memory.testConstruction) {
            const action: Action = new Action(ACTIONPRIO.HIGHEST, ACTIONTYPE.ROADNEW, new RoadNewPayload('bede85c68529611', 'f5680774d1c1fe8'));
            QueueStorage.instance().enqueue(this._room.name, QUEUETYPE.CONSTRUCTION, action);
            this._room.memory.testConstruction = true;
        }

        this._services.forEach(service => service.update());
    }

    public addService(serviceName: SERVICE_TYPE): void {
        log.debug(`Adding service ${serviceName} to room ${this._room.name}...`);
        if (!this._room.memory._services || !this._room.memory._services.includes(serviceName)) {
            const service = this.initService(serviceName);
            if (service) {
                this._services.push(service);
            }
        }
    }

    private analyse(): void {
        log.debug('Analyse room...');
        this._analyzer.findSources();
    }

    private loadServices(): BaseService[] {
        log.debug('Loading services from memory...');
        const services: BaseService[] = [];
        const serviceNames = this._room.memory._services as SERVICE_TYPE[] || [];
        log.debug(`Memory Services: ${serviceNames.length}`);
        serviceNames.forEach(serviceName => {
            const service = this.initService(serviceName);
            if (service) {
                services.push(service);
            }
        });

        log.debug(`Services initialised: ${services.length}`);
        return services;
    }

    private saveServices(): void {
        log.debug('Saving services to memory...');
        const serviceNames: SERVICE_TYPE[] = [];
        this._services.forEach(service => {
            switch (typeof service) {
                case (typeof HarvesterCreepService):
                    serviceNames.push(SERVICE_TYPE.HARVESTERCREEP);
                    break;
                case (typeof UpgraderCreepService):
                    serviceNames.push(SERVICE_TYPE.UPGRADERCREEP);
                    break;
                case (typeof SpawnService):
                    serviceNames.push(SERVICE_TYPE.SPAWN);
                    break;
                case (typeof ConstructionCreepService):
                    serviceNames.push(SERVICE_TYPE.CONSTRUCTIONCREEP);
                    break;
            }
        });
        this._room.memory._services = serviceNames;
        log.debug(`Saved ${serviceNames.length} to memory`);
    }

    private initService(serviceName: SERVICE_TYPE): BaseService | undefined {
        // TODO: Use FactoryPattern to create services
        log.debug(`Init service ${serviceName}...`);
        switch (serviceName) {
            case SERVICE_TYPE.HARVESTERCREEP:
                return new HarvesterCreepService(this._room.name);
            case SERVICE_TYPE.UPGRADERCREEP:
                return new UpgraderCreepService(this._room.name);
            case SERVICE_TYPE.SPAWN:
                return new SpawnService(this._room.name);
            case SERVICE_TYPE.CONSTRUCTIONCREEP:
                return new ConstructionCreepService(this._room.name);
        }
        return undefined;
    }
}
