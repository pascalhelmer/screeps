import { log } from '../utils/logger/Log';
import { CreepService } from './CreepService';


export class HarvesterCreepService extends CreepService {

    constructor(roomName: string) {
        super(roomName);
    }

    public update(): void {
        if (this._creeps.length === 0) {
            log.debug(`Room: ${this._roomName} | Birth new harvester creep...`);
            this.birth();
        }

        super.update();
    }

    protected birth(): void {
        // TODO: Calculate body
        log.debug(`Room: ${this._roomName} | Calculating new body for harvester...`);
        super.birth([WORK, CARRY, MOVE], {} as Memory);
    }
}
