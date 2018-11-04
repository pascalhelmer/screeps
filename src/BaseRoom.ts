import { BaseSpawn } from './BaseSpawn';
import { BaseService } from "./service/BaseService";
import { Queue } from './utils/Queue';


export class BaseRoom extends Room {

    private services: BaseService[];
    private spawns: BaseSpawn[];
    private queue: Queue;

    constructor() {
        super('');

        this.services = [];
        this.spawns = [];
        this.queue = new Queue();
    }

    public update(): void {
        this.analyse();

        this.services.forEach(service => service.update());
    }

    private analyse(): void {

    }
}
