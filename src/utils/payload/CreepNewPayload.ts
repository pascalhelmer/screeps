import { Payload } from "./Payload";


export class CreepNewPayload extends Payload {
    public body: string[];
    public memory: Memory;

    constructor(body: string[], role: string, memory: Memory) {
        super();

        this.body = body;
        memory.role = role;
        this.memory = memory;
    }
}
