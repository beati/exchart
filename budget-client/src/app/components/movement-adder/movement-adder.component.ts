import { Component, OnInit } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-movement-adder',
    templateUrl: './movement-adder.component.html',
    styleUrls: ['./movement-adder.component.scss'],
})
export class MovementAdderComponent implements OnInit {
    constructor(
        private readonly budgetService: BudgetService,
    ) { }

    ngOnInit(): void {
    }
}
