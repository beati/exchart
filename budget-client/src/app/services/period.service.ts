import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { DateTime } from 'luxon'

export interface Period {
    Mode: string
    Year: number
    Month?: number
}

@Injectable({
    providedIn: 'root'
})
export class PeriodService {
    PeriodChange: BehaviorSubject<Period>

    constructor() {
        const now = DateTime.local()
        this.PeriodChange = new BehaviorSubject<Period>({
            Mode: 'Month',
            Year: now.year,
            Month: now.month,
        })
    }
}
