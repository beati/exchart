import { Injectable } from '@angular/core'

import { fromEvent, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export enum DisplayType { Mobile, Desktop }

const mobileBreakpoint = 900

@Injectable({
    providedIn: 'root',
})
export class ResponsiveService {
    DisplayTypeSig: Observable<DisplayType>

    constructor() {
        this.DisplayTypeSig = fromEvent(window, 'resize').pipe(
            map(() => {
                return this.DisplayType()
            }),
        )
    }

    DisplayType(): DisplayType {
        const width = window.innerWidth
        if (width <= mobileBreakpoint) {
            return DisplayType.Mobile
        }
        return DisplayType.Desktop
    }
}
