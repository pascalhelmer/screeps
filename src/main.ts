import { BaseRoom } from './BaseRoom';
import { SERVICE_TYPE } from "./ServiceType.enum";
import { ErrorMapper } from './utils/ErrorMapper';
import { log } from './utils/logger/Log';


function mainLoop() {
    // Automatically delete memory of missing creeps
    log.debug('Deleting memory of missing creeps...');
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            log.info(`Deleting memory of creep ${name}`);
            delete Memory.creeps[name];
        }
    }

    // Handle rooms
    log.debug('Handling rooms...');
    for (const room in Game.rooms) {
        log.debug(`Current room: ${room}`);
        const baseRoom: BaseRoom = new BaseRoom(Game.rooms[room]);
        baseRoom.load();
        baseRoom.addService(SERVICE_TYPE.HARVESTERCREEP);
        baseRoom.addService(SERVICE_TYPE.SPAWN);
        baseRoom.update();
        baseRoom.save();
    }
}

export const loop = ErrorMapper.wrapLoop(() => {
    mainLoop();
});
