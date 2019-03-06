import { Component, Input, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { Budget } from '../../domain/domain'

import { Period, PeriodDuration, PeriodService } from '../../services/period.service'
import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-tabs',
    templateUrl: './budget-tabs.component.html',
    styleUrls: ['./budget-tabs.component.scss'],
})
export class BudgetTabsComponent implements OnInit {
    private budget: Budget

    private periodChangeSub: Subscription

    @Input()
    set Budget(budget: Budget) {
        this.budget = budget
        this.getMovements(this.periodService.PeriodChange.value)
    }
    get Budget(): Budget {
        return this.budget
    }

    constructor(
        private readonly periodService: PeriodService,
        private readonly budgetService: BudgetService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.periodChangeSub = this.periodService.PeriodChange.subscribe((period) => {
            switch (period.Duration) {
            case PeriodDuration.All:
                break;
            case PeriodDuration.All:
                break;
            case PeriodDuration.All:
                break;
            }
        })
    }

    private async getMovements(period: Period): Promise<void> {
        switch (period.Duration) {
        case PeriodDuration.All:
            await this.budgetService.GetMovements(this.budget.ID)
            break;
        case PeriodDuration.Year:
            await this.budgetService.GetMovements(this.budget.ID, period.Year)
            break;
        case PeriodDuration.Month:
            await this.budgetService.GetMovements(this.budget.ID, period.Year, period.Month)
            break;
        }
    }
}
