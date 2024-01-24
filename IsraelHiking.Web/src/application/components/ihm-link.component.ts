import { Component } from "@angular/core";
import { HashService } from "../services/hash.service";
import { ResourcesService } from "../services/resources.service";
import { RunningContextService } from "../services/running-context.service";
import { BaseMapComponent } from "./base-map.component";
import { Urls } from "../urls";

@Component({
    selector: "ihm-link",
    templateUrl: "./ihm-link.component.html",
    styleUrls: ["./ihm-link.component.scss"]
})
export class IhmLinkComponent extends BaseMapComponent {

    public target: string;

    constructor(resources: ResourcesService,
                private readonly hashService: HashService,
                private readonly runningContextService: RunningContextService) {
        super(resources);

        if (this.runningContextService.isIFrame) {
            this.target = "_blank";
        } else {
            this.target = "";
        }
    }

    public getHref(): string {
        if (this.runningContextService.isIFrame) {
            return this.hashService.getHref();
        } else {
            return window.location.origin;
        }
    }

    public getTooltipText(): string {
        if (this.runningContextService.isIFrame) {
            return this.resources.openInANewWindow;
        } else {
            return "";
        }
    }

    public isIFrameMobile() {
        return this.runningContextService.isIFrame && this.runningContextService.isMobile;
    }
}
