export abstract class Payload {
    public static serialize(value: Payload): string {
        return JSON.stringify(value);
    }

    public static deserialize(value: string): Payload {
        return JSON.parse(value);
    };
}

