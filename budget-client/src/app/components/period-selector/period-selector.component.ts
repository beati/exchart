import { Component, OnInit } from '@angular/core'

import { PeriodService, Period } from '../../services/period.service'

@Component({
    selector: 'app-period-selector',
    templateUrl: './period-selector.component.html',
    styleUrls: ['./period-selector.component.scss']
})
export class PeriodSelectorComponent implements OnInit {
    Period: Period

    constructor(
        private readonly periodService: PeriodService,
    ) {}

    ngOnInit() {
        this.Period = this.periodService.PeriodChange.value

        this.periodService.PeriodChange.subscribe((period) => {
            this.Period = period
        })
    }
}
