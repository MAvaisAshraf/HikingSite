import { Injectable } from "@angular/core";
import { File as FileSystemWrapper, IFile } from "@awesome-cordova-plugins/file/ngx";
import * as pmtiles from "pmtiles";

class CapacitorSource implements pmtiles.Source {

    constructor(private file: IFile) {}

    getBytes(offset: number, length: number): Promise<pmtiles.RangeResponse> {
        const slice = this.file.slice(offset, offset + length);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                resolve({ data: arrayBuffer as any});
            };
            reader.onerror = () => {
                reject(new Error("Unable to read file: " + this.file.name));
            }
            reader.readAsArrayBuffer(slice);
        })
    }

    getKey() { return this.file.name }
}

@Injectable()
export class PmTilesService {

    private sourcesCache: Map<string, CapacitorSource>;

    constructor(private readonly fileStsyemWrapper: FileSystemWrapper) { 
        this.sourcesCache = new Map();
    }

    private async getSource(filePath: string): Promise<pmtiles.Source> {
        if (this.sourcesCache.has(filePath)) {
            return this.sourcesCache.get(filePath);
        }
        const dir = await this.fileStsyemWrapper.resolveDirectoryUrl(this.fileStsyemWrapper.dataDirectory);
        const file = await this.fileStsyemWrapper.getFile(dir, filePath, {create: false});
        return new Promise((resolve, reject) => {
            file.file((file) => {
                const source = new CapacitorSource(file);
                this.sourcesCache.set(filePath, source);
                resolve(source);
            }, reject);
        });
    }

    /**
     * Get's a tile from the stored pmtiles file
     * @param url - should be something like custom://filename-without-pmtiles-extention/{z}/{x}/{y}.png
     * @returns 
     */
    public async getTile(url: string): Promise<ArrayBuffer> {
        const splitUrl = url.split("/");
        const fileName = splitUrl[2] + ".pmtiles";
        const z = +splitUrl[splitUrl.length - 3];
        const x = +splitUrl[splitUrl.length - 2];
        const y = +(splitUrl[splitUrl.length - 1].split(".")[0]);
        const source = await this.getSource(fileName);
        const pmTilesProvider = new pmtiles.PMTiles(source);
        const response = await pmTilesProvider.getZxy(z, x, y);
        return response.data;
    }
}