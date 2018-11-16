import { BaseRoom } from './BaseRoom';
import { SERVICE_TYPE } from "./ServiceType.enum";
import { ErrorMapper } from './utils/ErrorMapper';
import { log } from './utils/logger/Log';

function mainLoop() {
    log.info(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    // Handle rooms
    for (const room in Game.rooms) {
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
