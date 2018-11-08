import { BaseService } from './service/BaseService';
import { HarvesterCreepService } from "./service/HarvesterCreepService";
import { SpawnService } from "./service/SpawnService";


enum SERVICE_TYPE {
    SPAWN,
    HARVESTERCREEP
}

export class BaseRoom extends Room {

    private _room: Room;
    private _services: BaseService[];

    constructor(room: Room) {
        super(room.name);

        this._room = room;
        this._services = this.loadServices();
    }

    public update(): void {
        this.analyse();

        this._services.forEach(service => service.update());
    }

    private analyse(): void {

    }

    private loadServices(): BaseService[] {
        const services: BaseService[] = [];
        const serviceNames = this._room.memory._services as SERVICE_TYPE[];
        serviceNames.forEach(serviceName => {
            const service = this.initService(serviceName);
            if (service) {
                services.push(service);
            }
        });

        return services;
    }

    private initService(serviceName: SERVICE_TYPE): BaseService | undefined {
        switch (serviceName) {
            case SERVICE_TYPE.HARVESTERCREEP:
                return new HarvesterCreepService(this._room.name);
            case SERVICE_TYPE.SPAWN:
                return new SpawnService(this._room.name);
        }
        return undefined;
    }
}
