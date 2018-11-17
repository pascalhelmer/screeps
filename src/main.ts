import { BaseRoom } from './BaseRoom';
import { SERVICE_TYPE } from './ServiceType.enum';
import { ErrorMapper } from './utils/ErrorMapper';
import * as Profiler from './utils/Profiler';
import { profileRecord } from './utils/Profiler/Profiler';


global.Profiler = Profiler.init();

export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    profileRecord('clearMemory', true);
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }
    profileRecord('clearMemory', false);

    // Handle rooms
    for (const room in Game.rooms) {
        const baseRoom: BaseRoom = new BaseRoom(Game.rooms[room]);
        baseRoom.load();
        baseRoom.addService(SERVICE_TYPE.HARVESTERCREEP);
        baseRoom.addService(SERVICE_TYPE.SPAWN);
        baseRoom.update();
        baseRoom.save();
    }
});
