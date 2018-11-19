
export class RoomAnalyzer {

    private _room: Room;

    public constructor(room : Room) {
        this._room = room;
    }

    public findSources() {
        const sources = this._room.find(FIND_SOURCES);
        const result = [];

        if (this._room.memory.sources !== undefined) {
            return this._room.memory.sources;
        }

        for (const source of sources) {
            result.push({
                dockable: this._room.lookForAtArea(
                    LOOK_TERRAIN,
                    source.pos.y-1,
                    source.pos.x-1,
                    source.pos.y+1,
                    source.pos.x+1,
                    true
                ).reduce((res, src) => res + (src.terrain === 'plain' || src.terrain === 'swamp' ? 1 : 0), 0),
                id: source.id,
            });
        }

        this._room.memory.sources = result;

        return result;
    }

}
