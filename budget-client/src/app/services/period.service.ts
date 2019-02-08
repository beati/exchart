import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { DateTime } from 'luxon'

export enum PeriodDuration { All, Year, Month }

export class Period {
    Duration: PeriodDuration
    Year: number
    Month: number

    constructor() {
        this.Duration = PeriodDuration.Month
        this.Today()
    }

    Today(): void {
        const now = DateTime.local()
        this.Year = now.year
        this.Month = now.month
    }

    SetDuration(duration: PeriodDuration): void {
        this.Duration = duration
    }

    Previous(): void {
        this.shift(-1)
    }

    Next(): void {
        this.shift(1)
    }

    private shift(n: number): void {
        switch (this.Duration) {
        case PeriodDuration.Month:
            const january = 1
            const december = 12
            this.Month += n
            if (this.Month < january) {
                this.Month = december
                this.Year -= 1
            } else if (this.Month > december) {
                this.Month = january
                this.Year += 1
            }
            break
        case PeriodDuration.Year:
            this.Year += n
            break
        }
    }
}

@Injectable({
    providedIn: 'root',
})
export class PeriodService {
    PeriodChange: BehaviorSubject<Period>

    constructor() {
        this.PeriodChange = new BehaviorSubject<Period>(new Period())
    }
}
