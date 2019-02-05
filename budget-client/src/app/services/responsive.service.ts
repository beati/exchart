import { Injectable } from '@angular/core'

import { fromEvent, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export enum DisplayType { Mobile, Desktop }

const mobileBreakpoint = 900

@Injectable({
    providedIn: 'root',
})
export class ResponsiveService {
    DisplayChange: Observable<DisplayType>

    constructor() {
        this.DisplayChange = fromEvent(window, 'resize').pipe(
            map(() => {
                return this.Display()
            }),
        )
    }

    Display(): DisplayType {
        const width = window.innerWidth
        if (width < mobileBreakpoint) {
            return DisplayType.Mobile
        }
        return DisplayType.Desktop
    }
}
