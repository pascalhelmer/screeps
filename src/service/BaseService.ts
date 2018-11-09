export abstract class BaseService {

    protected _roomName: string;

    constructor(roomName: string) {
        this._roomName = roomName;
    }

    public abstract update(): void;
}
