import { ConfigService } from "../ConfigService";
import * as cp from "child_process";
import * as path from "path";
import { LoggingService } from "../LoggingService";
import { chdir } from "process";

export type RubyRunnerCommandOptions = {
    vscodeWorkspaceFolder: string;
    scriptFile: string;
};

export type RubyProcessCallback = (
    error: any,
    stdout: any,
    stderr: any
) => void;
export type RubyProcessOnExitCallback = (code: number, signal: any) => void;

export type ExtractScriptFileFunction = (
    loggingService: LoggingService,
    rubyScriptService: RubyScriptService
) => void;

export class RubyScriptService {
    private _process!: cp.ChildProcess | undefined | null;
    private _commandLineOptions: RubyRunnerCommandOptions;
    private _callback: RubyProcessCallback;
    private _args: string[] | undefined;

    get internel() {
        return this._process;
    }

    /**
     * Creates the ruby script runner.
     *
     * @param configService
     * @param loggingService
     * @param header
     * @param callback
     */
    constructor(
        private readonly configService: ConfigService,
        private readonly loggingService: LoggingService,
        header: RubyRunnerCommandOptions,
        callback: RubyProcessCallback
    ) {
        this._commandLineOptions = header;
        this._callback = callback;
        this._process = null;
        this._args = undefined;

        this.makeCommand();
    }

    makeCommand() {
        const { vscodeWorkspaceFolder, scriptFile } = this._commandLineOptions;
        const extensionPath =
            this.configService.getExtensionContext().extensionPath;

        this.loggingService.info(`현재 확장의 경로는 ${extensionPath} 입니다`);
        const rubyFilePath = path.join(extensionPath, "RGSS3", "index.rb");

        this._args = [
            rubyFilePath,
            `--output="${vscodeWorkspaceFolder}"`,
            `--input="${scriptFile}"`,
        ];
    }

    run(): void | this {
        this._process = cp.execFile(
            `ruby`,
            this._args,
            {
                encoding: "utf8",
                maxBuffer: 1024 * 1024,
                cwd: this.configService.getExtensionContext().extensionPath,
                shell: true,
            },
            this._callback
        );
        if (!this._process) {
            return;
        }
        this._process.stdout!.on("data", (data: any) => {
            this.loggingService.info(data);
        });
        this._process.stdout!.on("end", (data: any) => {
            this.loggingService.info(data);
        });
        this._process.stdin!.end();
        return this;
    }

    pendingTerminate() {
        if (!this._process) return;
        this._process.on("beforeExit", () => this._process!.kill());
    }

    onExit(callback: RubyProcessOnExitCallback) {
        if (!this._process) return;
        this._process.on("exit", callback);
    }
}

export function extractScriptFiles(
    loggingService: LoggingService,
    rubyScriptService: RubyScriptService
) {
    rubyScriptService.run()!.onExit((code: number, signal: any) => {
        loggingService.info(`${code} 스크립트 추출이 완료되었습니다.`);
    });
    rubyScriptService.pendingTerminate();
}
