import { Component, OnDestroy, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { Period, PeriodDuration, PeriodService } from '../../services/period.service'

@Component({
    selector: 'app-period-selector',
    templateUrl: './period-selector.component.html',
    styleUrls: ['./period-selector.component.scss'],
})
export class PeriodSelectorComponent implements OnInit, OnDestroy {
    PeriodDuration = PeriodDuration

    Period: Period

    PeriodChangeSub: Subscription

    constructor(
        private readonly periodService: PeriodService,
    ) {}

    ngOnInit(): void {
        this.Period = this.periodService.PeriodChange.value

        this.PeriodChangeSub = this.periodService.PeriodChange.subscribe((period) => {
            this.Period = period
        })
    }

    ngOnDestroy(): void {
        this.PeriodChangeSub.unsubscribe()
    }

    Duration(): string {
        switch (this.Period.Duration) {
        case PeriodDuration.All:
            return 'All'
        case PeriodDuration.Year:
            return 'Year'
        case PeriodDuration.Month:
            return 'Month'
        }
    }

    SetDuration(duration: PeriodDuration): void {
        this.Period.Duration = duration
        this.periodService.PeriodChange.next(this.Period)
    }

    Today(): void {
        this.Period.Today()
        this.periodService.PeriodChange.next(this.Period)
    }

    Previous(): void {
        this.Period.Previous()
        this.periodService.PeriodChange.next(this.Period)
    }

    Next(): void {
        this.Period.Next()
        this.periodService.PeriodChange.next(this.Period)
    }
}
