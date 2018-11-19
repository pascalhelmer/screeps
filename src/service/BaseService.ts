export abstract class BaseService {

    protected _room: Room;

    constructor(roomName: string) {
        this._room = Game.rooms[roomName];
    }

    public abstract update(): void;
}
