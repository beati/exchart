import { Component, Input } from '@angular/core'

import { Budget } from '../../domain/domain'

@Component({
    selector: 'app-budget-tabs',
    templateUrl: './budget-tabs.component.html',
    styleUrls: ['./budget-tabs.component.scss'],
})
export class BudgetTabsComponent {
    private budget: Budget

    @Input()
    set Budget(budget: Budget) {
        this.budget = budget
    }
    get Budget(): Budget {
        return this.budget
    }
}
