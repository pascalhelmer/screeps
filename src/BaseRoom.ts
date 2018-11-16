import { BaseService } from './service/BaseService';
import { HarvesterCreepService } from './service/HarvesterCreepService';
import { SpawnService } from './service/SpawnService';
import { SERVICE_TYPE } from './ServiceType.enum';
import { log } from './utils/logger/Log';


export class BaseRoom {

    private _room: Room;
    private _services: BaseService[];

    constructor(room: Room) {
        this._room = room;
        this._services = [];
    }

    public load(): void {
        this._services = this.loadServices();
    }

    public save(): void {
        this.saveServices();
    }

    public update(): void {
        this.analyse();

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
                case (typeof SpawnService):
                    serviceNames.push(SERVICE_TYPE.SPAWN);
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
            case SERVICE_TYPE.SPAWN:
                return new SpawnService(this._room.name);
        }
        return undefined;
    }
}
