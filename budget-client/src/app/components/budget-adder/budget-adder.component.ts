import { Component } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-budget-adder',
    templateUrl: './budget-adder.component.html',
    styleUrls: ['./budget-adder.component.scss'],
})
export class BudgetAdderComponent {
    BudgetFormData = {
        Submitting: false,
        Error: false,
        Email: '',
    }

    constructor(
        private readonly budgetService: BudgetService,
    ) {}

    async AddBudget(): Promise<void> {
        try {
            this.BudgetFormData.Submitting = true
            await this.budgetService.AddJointBudget(this.BudgetFormData.Email)
            this.BudgetFormData.Submitting = false
        } catch (error) {
            this.BudgetFormData.Submitting = false
            this.BudgetFormData.Error = true
        }
    }
}
