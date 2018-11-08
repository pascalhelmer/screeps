import { CreepService } from './CreepService';


export class HarvesterCreepService extends CreepService {

    constructor(roomName: string) {
        super(roomName);
    }

    public update(): void {
        if (this._creeps.length === 0) {
            this.birth();
        }

        super.update();
    }

    protected birth(): void {
        // TODO: Calculate body
        super.birth([WORK, CARRY, MOVE], {} as Memory);
    }
}
