import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { filter, map, merge, Observable, scan, tap } from 'rxjs';

const aggregatePathParamsNotifiers = (route: ActivatedRoute) => {
  let currentRoute: ActivatedRoute | null = route;
  const params$ = [];
  while (currentRoute) {
    params$.push(currentRoute.params);
    currentRoute = currentRoute.firstChild;
  }
  return params$;
};

const aggregatePathParams = (snapshot: ActivatedRouteSnapshot) => {
  let currentSnapshot = snapshot;
  const pathParams: Record<string, string> = {
    ...snapshot.params,
  };
  while (currentSnapshot.firstChild) {
    currentSnapshot = currentSnapshot.firstChild;
    Object.assign(pathParams, currentSnapshot.params);
  }
  return pathParams;
};

export const collectPathParamsWithActivatedRoute = (
  activatedRoute: ActivatedRoute
): Observable<Record<string, string>> => {
  return merge(...aggregatePathParamsNotifiers(activatedRoute)).pipe(
    scan((acc, params) => ({ ...acc, ...params }), {})
  );
};

export const collectPathParamsWithEvents = (router: Router) =>
  router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => {
      const {
        routerState: { snapshot },
      } = router;

      return aggregatePathParams(snapshot.root);
    }),
    tap(console.log)
  );
