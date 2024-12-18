import { inject, Injectable } from "@angular/core";
import { StyleSpecification } from "maplibre-gl";

import { FileService } from "./file.service";

@Injectable()
export class DefaultStyleService {
    public style: StyleSpecification;

    private readonly fileService = inject(FileService);

    constructor() {
        this.style = {
            version: 8,
            sources: {},
            layers: [],
            glyphs: this.fileService.getFullUrl("fonts/glyphs/{fontstack}/{range}.pbf"),
            sprite: this.fileService.getFullUrl("content/sprite/sprite")
        };
    }
}
