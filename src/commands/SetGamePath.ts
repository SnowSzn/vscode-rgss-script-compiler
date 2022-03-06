import * as vscode from "vscode";
import { ConfigService } from "../ConfigService";
import { LoggingService } from "../LoggingService";
import { Path } from "../utils/Path";

/**
 * 메인 게임 폴더를 설정합니다.
 *
 * @param logging
 */
export async function setGamePath(
    configService: ConfigService,
    loggingService: LoggingService
) {
    const value = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "게임 폴더 설정",
    });

    if (value) {
        loggingService.info(
            `설정된 게임 폴더는 ${Path.resolve(value[0])} 입니다`
        );
        configService.setGameFolder(value[0]);
        await configService.saveConfig();
    }
}