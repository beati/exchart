import { Component, ViewChild } from '@angular/core'

import { MatDialogRef } from '@angular/material'

import { BudgetAdderComponent } from '../budget-adder/budget-adder.component'

@Component({
    selector: 'app-budget-adder-dialog',
    templateUrl: './budget-adder-dialog.component.html',
    styleUrls: ['./budget-adder-dialog.component.scss'],
})
export class BudgetAdderDialogComponent {
    @ViewChild('budgetAdder') BudgetAdder: BudgetAdderComponent

    Submitting = false

    constructor(
        private readonly dialogRef: MatDialogRef<BudgetAdderDialogComponent>,
    ) { }

    Cancel(): void {
        this.dialogRef.close()
    }

    async AddBudget(): Promise<void> {
        this.Submitting = true
        const success = await this.BudgetAdder.AddBudget()
        this.Submitting = false
        if (success) {
            this.dialogRef.close()
        }
    }
}
