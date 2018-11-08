import { BaseRoom } from "./BaseRoom";
import { ErrorMapper } from './utils/ErrorMapper';


export const loop = ErrorMapper.wrapLoop(() => {
    console.log(`Current game tick is ${Game.time}`);

    // Automatically delete memory of missing creeps
    for (const name in Memory.creeps) {
        if (!(name in Game.creeps)) {
            delete Memory.creeps[name];
        }
    }

    for (const room in Game.rooms) {
        const baseRoom: BaseRoom = new BaseRoom(Game.rooms[room]);
        baseRoom.load();
        baseRoom.update();
        baseRoom.save();
    }
});
