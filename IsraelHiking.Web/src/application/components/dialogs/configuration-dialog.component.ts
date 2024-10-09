import { Component, inject } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { Store } from "@ngxs/store";

import { ResourcesService } from "../../services/resources.service";
import { RunningContextService } from "../../services/running-context.service";
import { ToastService } from "../../services/toast.service";
import { LoggingService } from "../../services/logging.service";
import { initialState } from "../../reducers/initial-state";
import {
    SetBatteryOptimizationTypeAction,
    ToggleAutomaticRecordingUploadAction,
    ToggleGotLostWarningsAction
} from "../../reducers/configuration.reducer";
import type { ApplicationState, BatteryOptimizationType } from "../../models/models";

@Component({
    selector: "configuration-dialog",
    templateUrl: "./configuration-dialog.component.html"
})
export class ConfigurationDialogComponent {

    public batteryOptimizationType$: Observable<BatteryOptimizationType>;
    public isAutomaticRecordingUpload$: Observable<boolean>;
    public isGotLostWarnings$: Observable<boolean>;

    public readonly resources = inject(ResourcesService);

    private readonly dialogRef = inject(MatDialogRef);
    private readonly runningContextService = inject(RunningContextService);
    private readonly toastService = inject(ToastService);
    private readonly logginService = inject(LoggingService);
    private readonly store = inject(Store);

    constructor() {
        this.batteryOptimizationType$ = this.store.select((state: ApplicationState) => state.configuration.batteryOptimizationType);
        this.isAutomaticRecordingUpload$ = this.store.select((state: ApplicationState) => state.configuration.isAutomaticRecordingUpload);
        this.isGotLostWarnings$ = this.store.select((state: ApplicationState) => state.configuration.isGotLostWarnings);
    }

    public isApp() {
        return this.runningContextService.isCapacitor;
    }

    public toggleAutomaticRecordingUpload() {
        this.store.dispatch(new ToggleAutomaticRecordingUploadAction());
    }

    public setBatteryOptimizationType(batteryOptimizationType: BatteryOptimizationType) {
        this.store.dispatch(new SetBatteryOptimizationTypeAction(batteryOptimizationType));
    }

    public toggleGotLostWarnings() {
        this.store.dispatch(new ToggleGotLostWarningsAction());
    }

    public clearData() {
        this.toastService.confirm({
            type: "YesNo",
            message: this.resources.areYouSure,
            confirmAction: () => {
                this.logginService.info("************** RESET DATA WAS PRESSED **************");
                this.store.reset(initialState);
                this.dialogRef.close();
            }
        });

    }
}
