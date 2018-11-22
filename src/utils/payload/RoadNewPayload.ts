import { Payload } from "./Payload";


export class RoadNewPayload extends Payload {
    public from: RoomPosition;
    public dest: RoomPosition;

    constructor(from: RoomPosition | string, dest: RoomPosition | string) {
        super();

        try {
            this.from = RoadNewPayload.prepareValue(from);
        } catch (err) {
            throw err;
        }

        try {
            this.dest = RoadNewPayload.prepareValue(dest);
        } catch (err) {
            throw err;
        }
    }

    private static prepareValue(value: RoomPosition | string): RoomPosition {
        if (typeof value === 'string') {
            const temp = RoadNewPayload.toRoomPosition(value);
            if (temp) {
                return temp;
            } else {
                throw new Error(`Failed to find room position of ${value}`);
            }
        } else {
            return value;
        }
    }

    private static toRoomPosition(id: string): RoomPosition | undefined {
        const obj: RoomObject | null | undefined = Game.getObjectById(id);
        if (obj && obj !== null) {
            return obj.pos;
        }
        return undefined;
    }

    public static serialize(value: RoadNewPayload): string {
        return JSON.stringify([value.from, value.dest]);
    }

    public static deserialize(value: string): RoadNewPayload {
        const tempObj = JSON.parse(value);
        return new RoadNewPayload(
            Object.assign(new RoomPosition(0, 0, ''), tempObj[0]),
            Object.assign(new RoomPosition(0, 0, ''), tempObj[1])
        );
    }
}
