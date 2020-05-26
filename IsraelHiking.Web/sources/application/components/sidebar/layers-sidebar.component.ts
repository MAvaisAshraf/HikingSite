import { Component, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { select, NgRedux } from "@angular-redux/store";
import { Observable } from "rxjs";

import { SidebarService } from "../../services/sidebar.service";
import { LayersService } from "../../services/layers/layers.service";
import { ResourcesService } from "../../services/resources.service";
import { BaseMapComponent } from "../base-map.component";
import { BaseLayerAddDialogComponent } from "../dialogs/layers/base-layer-add-dialog.component";
import { BaseLayerEditDialogComponent } from "../dialogs/layers/base-layer-edit-dialog.component";
import { OverlayAddDialogComponent } from "../dialogs/layers/overlay-add-dialog.component";
import { OverlayEditDialogComponent } from "../dialogs/layers/overlay-edit-dialog-component";
import { RouteAddDialogComponent } from "../dialogs/routes/route-add-dialog.component";
import { RouteEditDialogComponent } from "../dialogs/routes/route-edit-dialog.component";
import { DownloadProgressDialogComponent } from "../dialogs/download-progress-dialog.component";
import { SelectedRouteService } from "../../services/layers/routelayers/selected-route.service";
import { SetSelectedRouteAction } from "../../reducres/route-editing-state.reducer";
import { ChangeRoutePropertiesAction, BulkReplaceRoutesAction } from "../../reducres/routes.reducer";
import { ExpandGroupAction, CollapseGroupAction } from "../../reducres/layers.reducer";
import { RunningContextService } from "../../services/running-context.service";
import { ToastService } from "../../services/toast.service";
import { PurchaseService } from "../../services/purchase.service";
import { ApplicationState, RouteData, EditableLayer, Overlay, CategoriesGroup } from "../../models/models";

@Component({
    selector: "layers-sidebar",
    templateUrl: "./layers-sidebar.component.html",
    styleUrls: ["./layers-sidebar.component.scss"],
    encapsulation: ViewEncapsulation.None
})
export class LayersSidebarComponent extends BaseMapComponent {

    @select((state: ApplicationState) => state.layersState.baseLayers)
    public baseLayers: Observable<EditableLayer[]>;

    @select((state: ApplicationState) => state.layersState.overlays)
    public overlays: Observable<Overlay[]>;

    @select((state: ApplicationState) => state.layersState.categoriesGroups)
    public categoriesGroups: Observable<CategoriesGroup>;

    @select((state: ApplicationState) => state.routes.present)
    public routes: Observable<RouteData[]>;

    @select((state: ApplicationState) => state.offlineState.lastModifiedDate)
    public lastModified: Observable<Date>;

    constructor(resources: ResourcesService,
                private readonly dialog: MatDialog,
                private readonly purchaseService: PurchaseService,
                private readonly layersService: LayersService,
                private readonly selectedRouteService: SelectedRouteService,
                private readonly sidebarService: SidebarService,
                private readonly runningContextService: RunningContextService,
                private readonly toastService: ToastService,
                private readonly ngRedux: NgRedux<ApplicationState>) {
        super(resources);
    }

    public closeSidebar() {
        this.sidebarService.hide();
    }

    public addBaseLayer(event: Event) {
        event.stopPropagation();
        this.dialog.open(BaseLayerAddDialogComponent);
    }

    public editBaseLayer(e: Event, layer: EditableLayer) {
        e.stopPropagation();
        let dialogRef = this.dialog.open(BaseLayerEditDialogComponent);
        dialogRef.componentInstance.setBaseLayer(layer);
    }

    public expand(group: string) {
        this.ngRedux.dispatch(new ExpandGroupAction({ name: group }));
    }

    public collapse(group: string) {
        this.ngRedux.dispatch(new CollapseGroupAction({ name: group }));
    }

    public getExpandState(group: string): boolean {
        return this.ngRedux.getState().layersState.expanded.find(l => l === group) != null;
    }

    public addOverlay(event: Event) {
        event.stopPropagation();
        this.dialog.open(OverlayAddDialogComponent);
    }

    public editOverlay(e: Event, layer: Overlay) {
        e.stopPropagation();
        let dialogRef = this.dialog.open(OverlayEditDialogComponent);
        dialogRef.componentInstance.setOverlay(layer);
    }

    public addRoute(event: Event) {
        event.stopPropagation();
        this.dialog.open(RouteAddDialogComponent);
    }

    public editRoute(routeData: RouteData, event: Event) {
        event.stopPropagation();
        this.dialog.open(RouteEditDialogComponent, {
            data: {
                ...routeData
            }
        });
    }

    public isBaseLayerSelected(baseLayer: EditableLayer): boolean {
        return this.layersService.isBaseLayerSelected(baseLayer);
    }

    public selectBaseLayer(baseLayer: EditableLayer) {
        this.layersService.selectBaseLayer(baseLayer.key);
    }

    public toggleVisibility(overlay: Overlay) {
        this.layersService.toggleOverlay(overlay);
    }

    public showOfflineButton(layer: EditableLayer) {
        let offlineState = this.ngRedux.getState().offlineState;
        return layer.isOfflineAvailable &&
            this.runningContextService.isCordova &&
            (offlineState.lastModifiedDate != null ||
            offlineState.isOfflineAvailable);
    }

    public isOfflineDownloadAvailable() {
        return this.runningContextService.isCordova &&
            this.ngRedux.getState().offlineState.isOfflineAvailable;
    }

    public isPurchaseAvailable() {
        return this.runningContextService.isCordova &&
            !this.ngRedux.getState().offlineState.isOfflineAvailable;
    }

    public orderOfflineMaps() {
        let userInfo = this.ngRedux.getState().userState.userInfo;
        if (userInfo == null || !userInfo.id) {
            this.toastService.warning(this.resources.loginRequired);
            return;
        }
        this.purchaseService.order();
    }

    public downloadOfflineMaps() {
        let userInfo = this.ngRedux.getState().userState.userInfo;
        if (userInfo == null || !userInfo.id) {
            this.toastService.warning(this.resources.loginRequired);
            return;
        }
        this.sidebarService.hide();
        DownloadProgressDialogComponent.openDialog(this.dialog);
    }

    public toggleOffline(event: Event, layer: EditableLayer, isOverlay: boolean) {
        event.stopPropagation();
        if (this.ngRedux.getState().offlineState.lastModifiedDate == null && !layer.isOfflineOn) {
            this.toastService.warning(this.resources.noOfflineFilesPleaseDownload);
            return;
        }
        this.layersService.toggleOffline(layer, isOverlay);
    }

    public toggleRoute(routeData: RouteData) {
        let selectedRoute = this.selectedRouteService.getSelectedRoute();
        if (selectedRoute != null && routeData.id === selectedRoute.id && routeData.state !== "Hidden") {
            this.ngRedux.dispatch(new SetSelectedRouteAction({ routeId: null }));
            routeData.state = "Hidden";
            this.ngRedux.dispatch(new ChangeRoutePropertiesAction(
                {
                    routeId: routeData.id,
                    routeData
                }));
            return;
        }
        if (routeData.state === "Hidden") {
            routeData.state = "ReadOnly";
            this.ngRedux.dispatch(new ChangeRoutePropertiesAction(
                {
                    routeId: routeData.id,
                    routeData
                }));
        }
        this.selectedRouteService.setSelectedRoute(routeData.id);
    }

    public isRouteVisible(routeData: RouteData) {
        return routeData.state !== "Hidden";
    }

    public isRouteSelected(routeData: RouteData) {
        let selectedRoute = this.selectedRouteService.getSelectedRoute();
        return selectedRoute != null && selectedRoute.id === routeData.id;
    }

    public dropRoute(event: CdkDragDrop<RouteData[]>) {
        let currentRoutes = [...this.ngRedux.getState().routes.present];
        moveItemInArray(currentRoutes, event.previousIndex, event.currentIndex);
        this.ngRedux.dispatch(new BulkReplaceRoutesAction({ routesData: currentRoutes }));
    }
}
