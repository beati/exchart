import { Component, OnInit, OnDestroy } from '@angular/core'

import { Subscription } from 'rxjs'

import { PeriodService, Period } from '../../services/period.service'

@Component({
    selector: 'app-period-selector',
    templateUrl: './period-selector.component.html',
    styleUrls: ['./period-selector.component.scss']
})
export class PeriodSelectorComponent implements OnInit, OnDestroy {
    Period: Period

    PeriodChangeSub: Subscription

    constructor(
        private readonly periodService: PeriodService,
    ) {}

    ngOnInit() {
        this.Period = this.periodService.PeriodChange.value

        this.PeriodChangeSub = this.periodService.PeriodChange.subscribe((period) => {
            this.Period = period
        })
    }

    ngOnDestroy() {
        this.PeriodChangeSub.unsubscribe()
    }

    SetMode(mode: string): void {
        this.Period.Mode = mode
    }

    Today(): void {
    }

    Previous(): void {
    }

    Next(): void {
    }
}
