import { Component} from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-budget-adder',
    templateUrl: './budget-adder.component.html',
    styleUrls: ['./budget-adder.component.scss'],
})
export class BudgetAdderComponent {
    EmailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ])

    constructor(
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) {}

    async AddBudget(): Promise<void> {
        this.EmailFormControl.markAsTouched()

        if (this.EmailFormControl.hasError('required') || this.EmailFormControl.hasError('email')) {
            return
        }

        try {
            await this.budgetService.AddJointBudget(this.EmailFormControl.value)
        } catch (error) {
            this.errorService.DisplayError()
        }
    }
}
