import { Component, Input, OnInit } from '@angular/core'

import { Budget } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-tabs',
    templateUrl: './budget-tabs.component.html',
    styleUrls: ['./budget-tabs.component.scss'],
})
export class BudgetTabsComponent implements OnInit {
    private budget: Budget

    @Input()
    set Budget(budget: Budget) {
        this.budget = budget
    }
    get Budget(): Budget {
        return this.budget
    }

    constructor(
        private readonly budgetService: BudgetService,
    ) {}

    async ngOnInit(): Promise<void> {
        await this.budgetService.GetMovements(this.budget.ID)
    }
}
