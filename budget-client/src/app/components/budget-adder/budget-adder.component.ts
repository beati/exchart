import { Component, OnInit } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-adder',
    templateUrl: './budget-adder.component.html',
    styleUrls: ['./budget-adder.component.scss'],
})
export class BudgetAdderComponent implements OnInit {
    constructor(
        private readonly budgetService: BudgetService,
    ) { }

    ngOnInit(): void {
    }
}
