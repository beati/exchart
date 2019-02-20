import { Component, Input } from '@angular/core'

import { Budget } from '../../domain/domain'

@Component({
    selector: 'app-budget-tabs',
    templateUrl: './budget-tabs.component.html',
    styleUrls: ['./budget-tabs.component.scss'],
})
export class BudgetTabsComponent {
    @Input() Budget: Budget
}
