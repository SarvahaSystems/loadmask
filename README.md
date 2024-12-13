# LoadMask Utility

LoadMask is a utility for displaying loading indicators (load masks) on HTML elements. It's designed to be easily integrated into web projects to provide a visual cue to users during asynchronous operations.

## Installation

1. **LoadMask Util File (`loadmask.util.ts`):**

   Copy the `loadmask.util.ts` file into your project's utility directory.

2. **LoadMask CSS File (`loadmask.css`):**

   Append the styles from `loadmask.css` into your global or project-specific stylesheets (e.g., `global.css`, `style.css`).

## Usage

### Angular
1. We have a button in a component `Component1`, on clicking the button we are requesting some data from api. A loadMask will be shown on the `#loader` element, which we will pass in the `getDataFromApi` present in the `dataService` method. This `getDataFromApi` method accepts a HTML element on which we want to show load-mask.
```
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-component1',
  styleUrls: ['./component1.component.css'],
  template: `
    <button (click)="getData()">Get Data from API 1</button>
    <div *ngIf="data">{{ data | json }}</div>
    <div #loader class="loader"></div>
  `,
})
export class Component1Component {
  data: any;

  @ViewChild('loader', { static: false })
  maskEle: ElementRef | undefined;

  constructor(private dataService: DataService) {}

  getData() {
    this.dataService
      .getDataFromApi(this.maskEle?.nativeElement)
      .subscribe((response) => {
        this.data = response;
      });
  }
}

```
2. `getDataFromApi` present in `DataService`
- `getSelector` will take HTML element and return a unique selector of that HTML element.
- and that selector will be then passed as a param in a request.
```
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoadMask } from './loadmask.util';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getDataFromApi(maskEle: any): Observable<any> {
    const selector = LoadMask.getSelector(maskEle);
    return this.http.get('https://jsonplaceholder.typicode.com/posts/1', {
      params: {
        selector,
      },
    });
  }
}
```

3. Interceptor (one who will intercept all the outgoing requests from the app)
- `maskEle` is the HTML element on which the load-mask is going to be added
- once the request returns data the load-mask will be removed in the `finalize` block.
```
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadMask } from './loadmask.util';

@Injectable()
export class MyInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const selector = req.params.get('selector');
    let maskEle: any | undefined;
    if (selector) {
      req = req.clone({
        params: req.params.delete('selector'),
      });
      maskEle = document.querySelector(selector);
    }
    if (maskEle) {
      LoadMask.showPreloader(maskEle);
    }

    return next.handle(req).pipe(
      finalize(() => {
        if (maskEle) {
          LoadMask.hidePreloader(maskEle);
        }
      })
    );
  }
}
```
