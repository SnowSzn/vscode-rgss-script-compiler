import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { Script } from "./Script";
import { ConfigService } from "../services/ConfigService";
import { Path } from "../utils/Path";

export class DataSourceFactory {
    public isReady = false;

    private options: DataSourceOptions;
    private dataSource: DataSource;

    constructor(workspacePath: string) {
        // this.options = {
        //     type: "sqlite",
        //     database: Path.join(workspacePath, "db.sqlite"),
        //     synchronize: true,
        //     namingStrategy: new SnakeNamingStrategy(),
        //     entities: [Script],
        //     logging: true,
        // };
        this.options = {
            type: "sqljs",
            location: Path.join(workspacePath, "db.sqlite"),
            synchronize: true,
            namingStrategy: new SnakeNamingStrategy(),
            entities: [Script],
            logging: true,
        };

        this.dataSource = new DataSource(this.options);

        this.initialize()
            .then(() => {
                console.info("DataSourceFactory initialized");
            })
            .catch((error: any) => {
                console.warn(error);
            });
    }

    public async initialize(): Promise<void> {
        try {
            await this.dataSource.initialize();
            this.isReady = true;
        } catch (error: any) {
            console.warn(error);
            this.isReady = false;
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }
}