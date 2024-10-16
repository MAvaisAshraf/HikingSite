import { inject, Injectable } from "@angular/core";
import { Store } from "@ngxs/store";

import { SidebarService } from "./sidebar.service";
import { MapService } from "./map.service";
import { SpatialService } from "./spatial.service";
import { SetPannedAction } from "../reducers/in-memory.reducer";
import type { Bounds, LatLngAlt } from "../models/models";

@Injectable()
export class FitBoundsService {
    public static readonly DEFAULT_MAX_ZOOM = 16;
    public isFlying = false;

    private readonly sidebarService = inject(SidebarService);
    private readonly mapService = inject(MapService);
    private readonly store = inject(Store);

    public async fitBounds(bounds: Bounds, noPadding = false) {
        await this.mapService.initializationPromise;
        const maxZoom = Math.max(this.mapService.map.getZoom(), 16);
        const mbBounds = SpatialService.boundsToMBBounds(bounds);
        let padding = 50;
        if (noPadding) {
            padding = 0;
        }
        this.store.dispatch(new SetPannedAction(new Date()));
        if (this.sidebarService.isSidebarOpen() && window.innerWidth >= 768) {
            this.mapService.map.fitBounds(mbBounds,
                {
                    maxZoom,
                    padding: { top: 50, left: 400, bottom: 50, right: 50 }
                });
        } else {
            this.mapService.map.fitBounds(mbBounds,
                {
                    maxZoom,
                    padding
                });
        }
    }

    public async flyTo(latLng: LatLngAlt, zoom: number) {
        await this.mapService.initializationPromise;
        if (SpatialService.getDistance(this.mapService.map.getCenter(), latLng) < 0.0001 &&
            Math.abs(zoom - this.mapService.map.getZoom()) < 0.01) {
            // ignoring flyto for small coordinates change:
            // this happens due to route percision reduce which causes another map move.
            return;
        }
        this.store.dispatch(new SetPannedAction(new Date()));
        this.mapService.map.flyTo({ center: latLng, zoom });
    }

    public async moveTo(center: LatLngAlt, zoom: number, bearing: number) {
        await this.mapService.initializationPromise;
        this.mapService.map.easeTo({
            bearing,
            center,
            zoom,
            animate: true,
            easing: (x) => x,
            offset: [0, 100]
        });
    }
}
