import { Component} from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { HttpErrorResponse } from '@angular/common/http'

import { StatusCode } from '../../services/http-status-codes'

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

    async AddBudget(): Promise<boolean> {
        this.EmailFormControl.markAsTouched()

        if (this.EmailFormControl.hasError('required') || this.EmailFormControl.hasError('email')) {
            return false
        }

        try {
            await this.budgetService.AddJointBudget(this.EmailFormControl.value)
        } catch (error) {
            let errorReference: string | undefined
            if (error instanceof HttpErrorResponse) {
                if (error.status === StatusCode.NotFound) {
                    errorReference = 'UserNotFound'
                }
            }
            this.errorService.DisplayError(errorReference)
            return false
        }
        return true
    }
}
