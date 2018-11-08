import { CreepService } from './CreepService';


export class HarvesterCreepService extends CreepService {

    constructor(roomName: string) {
        super(roomName);

    }

    protected birth(): void {
        // TODO: Calculate body
        super.birth([WORK, CARRY, MOVE], {} as Memory);
    }
}
