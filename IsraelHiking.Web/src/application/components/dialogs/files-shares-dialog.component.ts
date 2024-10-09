import { Component, inject } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { every } from "lodash-es";
import { Store } from "@ngxs/store";

import { ShareDialogComponent } from "./share-dialog.component";
import { DataContainerService } from "../../services/data-container.service";
import { FileService, FormatViewModel } from "../../services/file.service";
import { ResourcesService } from "../../services/resources.service";
import { ToastService } from "../../services/toast.service";
import { SetOfflineMapsLastModifiedDateAction } from "../../reducers/offline.reducer";
import type { ApplicationState, DataContainer } from "../../models/models";

@Component({
    selector: "files-share-dialog",
    templateUrl: "./files-shares-dialog.component.html"
})
export class FilesSharesDialogComponent {

    public isSaveAsOpen: boolean = false;
    public showHiddenWarning: boolean;
    public formats: FormatViewModel[];

    public readonly resources = inject(ResourcesService);

    private readonly dialog = inject(MatDialog);
    private readonly matDialogRef = inject(MatDialogRef);
    private readonly dataContainerService = inject(DataContainerService);
    private readonly fileService = inject(FileService);
    private readonly toastService = inject(ToastService);
    private readonly store = inject(Store);

    constructor() {
        this.formats = this.fileService.formats;
        this.showHiddenWarning = this.dataContainerService.hasHiddenRoutes();
    }

    public toggleSaveAs() {
        this.isSaveAsOpen = !this.isSaveAsOpen;
    }

    public async open(e: any) {
        const file = this.fileService.getFileFromEvent(e);
        if (!file) {
            return;
        }
        const offlineState = this.store.selectSnapshot((s: ApplicationState) => s.offlineState);
        if (file.name.endsWith(".ihm") && offlineState.isOfflineAvailable) {
            this.toastService.info(this.resources.openingAFilePleaseWait);
            try {
                await this.fileService.writeStyles(file);
                this.toastService.confirm({ type: "Ok", message: this.resources.finishedOpeningTheFile });
            } catch (ex) {
                this.toastService.error(ex, "Error opening ihm file");
            }
            return;
        }
        if (file.name.endsWith(".pmtiles")) {
            this.toastService.info(this.resources.openingAFilePleaseWait);
            await this.fileService.storeFileToCache(file.name, file);
            await this.fileService.moveFileFromCacheToDataDirectory(file.name);
            this.toastService.confirm({ type: "Ok", message: this.resources.finishedOpeningTheFile });
            this.store.dispatch(new SetOfflineMapsLastModifiedDateAction(new Date(file.lastModified)));
            return;
        }
        if (file.name.endsWith(".json")) {
            this.toastService.info(this.resources.openingAFilePleaseWait);
            await this.fileService.writeStyle(file.name, await this.fileService.getFileContent(file));
            this.toastService.confirm({ type: "Ok", message: this.resources.finishedOpeningTheFile });
            return;
        }
        try {
            await this.fileService.addRoutesFromFile(file);
            this.matDialogRef.close();
        } catch (ex) {
            this.toastService.error(ex as Error, this.resources.unableToLoadFromFile);
        }
    }

    public async save() {
        const data = this.dataContainerService.getDataForFileExport();
        if (!this.isDataSaveable(data)) {
            return;
        }
        try {
            await this.fileService.saveToFile(this.getName(data) + ".gpx", "gpx", data);
        } catch (ex) {
            this.toastService.error(ex as Error, this.resources.unableToSaveToFile);
        }
    }

    public async saveAs(format: FormatViewModel) {
        let outputFormat = format.outputFormat;
        let data = this.dataContainerService.getDataForFileExport();
        if (outputFormat === "all_gpx_single_track") {
            outputFormat = "gpx_single_track";
            data = this.dataContainerService.getData(false);
        }
        if (!this.isDataSaveable(data)) {
            return;
        }
        const name = this.getName(data);
        try {
            await this.fileService.saveToFile(`${name}.${format.extension}`, outputFormat, data);
        } catch (ex) {
            this.toastService.error(ex as Error, this.resources.unableToSaveToFile);
        }
    }

    public openShare() {
        this.dialog.open(ShareDialogComponent);
    }

    private getName(data: DataContainer): string {
        let name = "IsraelHikingMap";
        if (data.routes.length === 1 && data.routes[0].name) {
            name = data.routes[0].name;
        }
        return name;
    }

    private isDataSaveable(data: DataContainer): boolean {
        if (data.routes.length === 0) {
            this.toastService.warning(this.resources.unableToSaveAnEmptyRoute);
            return false;
        }
        if (every(data.routes, r => r.segments.length === 0 && r.markers.length === 0)) {
            this.toastService.warning(this.resources.unableToSaveAnEmptyRoute);
            return false;
        }
        return true;
    }
}
