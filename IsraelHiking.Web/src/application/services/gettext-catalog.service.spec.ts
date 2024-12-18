import { TestBed, inject } from "@angular/core/testing";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { GetTextCatalogService } from "./gettext-catalog.service";

describe("GetTextCatalogService", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GetTextCatalogService,
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
    });

    it("Should support language change", inject([GetTextCatalogService], (service: GetTextCatalogService) => {
        service.setCurrentLanguage("he");
        expect(service.getCurrentLanguage()).toBe("he");
    }));

    it("Should load language file from server", (inject([GetTextCatalogService, HttpTestingController],
        async (service: GetTextCatalogService, mockBackend: HttpTestingController) => {

        service.setCurrentLanguage("he");

        const promise = service.loadRemote("url").then(() => {
            expect(service.getString("word")).toBe("word's translation");
        });

        mockBackend.match(() => true)[0].flush({ word: "word's translation" });
        return promise;
    })));

    it("Should return original word when translation is missing", (inject([GetTextCatalogService, HttpTestingController],
        async (service: GetTextCatalogService, mockBackend: HttpTestingController) => {

        service.setCurrentLanguage("he");

        const promise = service.loadRemote("url").then(() => {
            expect(service.getString("word")).toBe("word");
        });

        mockBackend.match(() => true)[0].flush({});
        return promise;
    })));
});
