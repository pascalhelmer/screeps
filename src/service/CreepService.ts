import { BaseCreep } from '../creep/BaseCreep';
import { BaseService } from './BaseService';


export abstract class CreepService extends BaseService {

    protected creeps: BaseCreep[];

    constructor() {
        super();

        this.creeps = [];
    }

    public update(): void {
        this.creeps.forEach(creep => creep.update());
    }
}
