import { Payload } from "./Payload";


export class CreepNewPayload extends Payload {
    public body: string[];
    public memory: {};

    constructor(body: string[], role: string, memory: {}) {
        super();

        this.body = body;
        memory['role'] = role;
        this.memory = memory;
    }
}
