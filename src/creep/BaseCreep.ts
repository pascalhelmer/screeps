export abstract class BaseCreep extends Creep {

    constructor() {
        super(''); // TODO: Generate name
    }

    public abstract update(): void;
}
