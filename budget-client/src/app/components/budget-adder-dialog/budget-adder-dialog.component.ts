import { Component, OnInit } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-adder-dialog',
    templateUrl: './budget-adder-dialog.component.html',
    styleUrls: ['./budget-adder-dialog.component.scss'],
})
export class BudgetAdderDialogComponent implements OnInit {
    constructor(
        private readonly budgetService: BudgetService,
    ) { }

    ngOnInit(): void {
    }
}
