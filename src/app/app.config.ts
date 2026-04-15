import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  ApplicationRef,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker, SwUpdate } from '@angular/service-worker';
import { environment } from '@sr/environments/environment';
import { provideApi } from '@sr/shared/api';
import { concat, first, interval } from 'rxjs';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideApi(environment.apiUrl),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:10000',
      updateViaCache: 'all',
      type: 'module',
    }),
    provideAppInitializer(() => {
      const swUpdate = inject(SwUpdate);
      const appRef = inject(ApplicationRef);

      if (swUpdate.isEnabled) {
        const appIsStable$ = appRef.isStable.pipe(first((isStable) => isStable === true));
        const everyDay$ = interval(24 * 60 * 60 * 1000);

        // Der "Heartbeat" Check
        concat(appIsStable$, everyDay$).subscribe(() => swUpdate.checkForUpdate());

        // Die Reaktion auf das gefundene Update
        swUpdate.versionUpdates.subscribe((evt) => {
          if (evt.type === 'VERSION_READY') {
            location.reload();
          }
        });
      }
    }),
  ],
};
