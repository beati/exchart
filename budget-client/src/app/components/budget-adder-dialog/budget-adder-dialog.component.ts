import { Component } from '@angular/core'

import { MatDialogRef } from '@angular/material'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-adder-dialog',
    templateUrl: './budget-adder-dialog.component.html',
    styleUrls: ['./budget-adder-dialog.component.scss'],
})
export class BudgetAdderDialogComponent {
    BudgetFormData = {
        Submitting: false,
        Error: false,
        Email: '',
    }

    constructor(
        readonly DialogRef: MatDialogRef<BudgetAdderDialogComponent>,
        private readonly budgetService: BudgetService,
    ) { }

    async AddBudget(): Promise<void> {
        try {
            this.BudgetFormData.Submitting = true
            await this.budgetService.AddJointBudget(this.BudgetFormData.Email)
            this.BudgetFormData.Submitting = false
            this.DialogRef.close()
        } catch (error) {
            this.BudgetFormData.Submitting = false
            this.BudgetFormData.Error = true
        }
    }
}
