import { Component } from '@angular/core'
import { FormControl, NgForm, Validators } from '@angular/forms'

import { MatDialogRef } from '@angular/material'

import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-budget-adder-dialog',
    templateUrl: './budget-adder-dialog.component.html',
    styleUrls: ['./budget-adder-dialog.component.scss'],
})
export class BudgetAdderDialogComponent {
    EmailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ])

    constructor(
        readonly DialogRef: MatDialogRef<BudgetAdderDialogComponent>,
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) { }

    async AddBudget(): Promise<void> {
        try {
            await this.budgetService.AddJointBudget(this.EmailFormControl.value)
            this.DialogRef.close()
        } catch (error) {
            this.errorService.DisplayError()
        }
    }
}
