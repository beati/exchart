import { Component, OnInit } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-movement-adder-dialog',
    templateUrl: './movement-adder-dialog.component.html',
    styleUrls: ['./movement-adder-dialog.component.scss'],
})
export class MovementAdderDialogComponent implements OnInit {
    constructor(
        private readonly budgetService: BudgetService,
    ) { }

    ngOnInit(): void {
    }
}
