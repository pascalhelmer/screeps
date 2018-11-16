import { SourceMapConsumer } from 'source-map';
import * as Config from '../../config';
import { LogLevel } from './LogLevel.enum';


// <caller> (<source>:<line>:<column>)
const stackLineRe = /([^ ]*) \(([^:]*):([0-9]*):([0-9]*)\)/;

interface SourcePos {
    compiled: string;
    final: string;
    original: string | undefined;
    caller: string | undefined;
    path: string | undefined;
    line: number | undefined;
}

export function resolve(fileLine: string): SourcePos {
    const split = _.trim(fileLine).match(stackLineRe);
    if (!split || !Log.sourceMap) {
        return { compiled: fileLine, final: fileLine } as SourcePos;
    }

    const pos = { column: parseInt(split[4], 10), line: parseInt(split[3], 10) };

    const original = Log.sourceMap.originalPositionFor(pos);
    const line = `${split[1]} (${original.source}:${original.line})`;
    const out = {
        caller: split[1],
        compiled: fileLine,
        final: line,
        line: original.line,
        original: line,
        path: original.source,
    };

    return out;
}

function makeLogLink(pos: SourcePos): string {
    if (!Config.LOG.valid || !pos.caller || !pos.path || !pos.line || !pos.original) {
        return pos.final;
    }

    return link(logUrl(pos.path, `L${pos.line.toString()}`), pos.original);
}

function color(str: string, colorCode: string): string {
    return `<span style='color: ${colorCode}'>${str}</span>`;
}

function tooltip(str: string, title: string): string {
    return `<abbr title='${title}'>${str}</abbr>`;
}

function logUrl(path: string, line: string): string {
    return Config.LOG_URL_TEMPLATE(path, line);
}

function link(href: string, title: string): string {
    return `<a href='${href}' target="_blank">${title}</a>`;
}

function time(): string {
    return color(Game.time.toString(), "gray");
}

export class Log {
    public static sourceMap?: SourceMapConsumer;

    public static loadSourceMap() {
        try {
            // tslint:disable-next-line
            const map = require("main.js.map");
            if (map) {
                Log.sourceMap = new SourceMapConsumer(require("main.js.map"));
            }
        } catch (err) {
            console.log("failed to load source map", err);
        }
    }

    public get level(): number {
        return Memory.log.level;
    }

    public set level(value: number) {
        Memory.log.level = value;
    }

    public get showSource(): boolean {
        return Memory.log.showSource;
    }

    public set showSource(value: boolean) {
        Memory.log.showSource = value;
    }

    public get showTick(): boolean {
        return Memory.log.showTick;
    }

    public set showTick(value: boolean) {
        Memory.log.showTick = value;
    }

    private _maxFileString: number = 0;

    private static _instance: Log;

    public static instance(): Log {
        if (Log._instance) {
            return Log._instance;
        }

        if (Config.LOG_LOAD_SOURCE_MAP) {
            Log.loadSourceMap();
        }

        Log._instance = new Log();
        return Log._instance;
    }

    private constructor() {
        _.defaultsDeep(Memory, {
            log: {
                level: Config.LOG_LEVEL,
                showSource: Config.LOG_PRINT_LINES,
                showTick: Config.LOG_PRINT_TICK,
            }
        });
    }

    public trace(error: Error): Log {
        if (this.level >= LogLevel.ERROR && error.stack) {
            console.log(this.resolveStack(error.stack));
        }

        return this;
    }

    public error(...args: any[]) {
        if (this.level >= LogLevel.ERROR) {
            console.log.apply(this, this.buildArguments(LogLevel.ERROR).concat([].slice.call(args)));
        }
    }

    public warning(...args: any[]) {
        if (this.level >= LogLevel.WARNING) {
            console.log.apply(this, this.buildArguments(LogLevel.WARNING).concat([].slice.call(args)));
        }
    }

    public info(...args: any[]) {
        if (this.level >= LogLevel.INFO) {
            console.log.apply(this, this.buildArguments(LogLevel.INFO).concat([].slice.call(args)));
        }
    }

    public debug(...args: any[]) {
        if (this.level >= LogLevel.DEBUG) {
            console.log.apply(this, this.buildArguments(LogLevel.DEBUG).concat([].slice.call(args)));
        }
    }

    public getFileLine(upStack = 4): string {
        const stack = new Error("").stack;

        if (stack) {
            const lines = stack.split("\n");

            if (lines.length > upStack) {
                const originalLines = _.drop(lines, upStack).map(resolve);
                const hoverText = _.map(originalLines, "final").join("&#10;");

                return this.adjustFileLine(
                    originalLines[0].final,
                    tooltip(makeLogLink(originalLines[0]), hoverText)
                );
            }
        }
        return "";
    }

    private buildArguments(level: number): string[] {
        const out: string[] = [];
        switch (level) {
            case LogLevel.ERROR:
                out.push(color("ERROR  ", "red"));
                break;
            case LogLevel.WARNING:
                out.push(color("WARNING", "yellow"));
                break;
            case LogLevel.INFO:
                out.push(color("INFO   ", "green"));
                break;
            case LogLevel.DEBUG:
                out.push(color("DEBUG  ", "gray"));
                break;
            default:
                break;
        }
        if (this.showTick) {
            out.push(time());
        }
        if (this.showSource) {
            out.push(this.getFileLine());
        }
        return out;
    }

    private resolveStack(stack: string): string {
        if (!Log.sourceMap) {
            return stack;
        }

        return _.map(stack.split("\n").map(resolve), "final").join("\n");
    }

    private adjustFileLine(visibleText: string, line: string): string {
        const newPad = Math.max(visibleText.length, this._maxFileString);
        this._maxFileString = Math.min(newPad, Config.LOG_MAX_PAD);
        this._maxFileString = Config.LOG_MAX_PAD;

        return `|${_.padRight(line, line.length + this._maxFileString - visibleText.length, " ")}|`;
    }
}

export const log = Log.instance();

global.log = log;
