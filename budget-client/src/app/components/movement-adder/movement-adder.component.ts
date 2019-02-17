import { Component, Input } from '@angular/core'

import { Account } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-movement-adder',
    templateUrl: './movement-adder.component.html',
    styleUrls: ['./movement-adder.component.scss'],
})
export class MovementAdderComponent {
    @Input() Account: Account

    MovementFormData = {
        Submitting: false,
        Error: false,
        Sign: '-1',
        Amount: undefined,
        Year: 2019,
    }

    constructor(
        private readonly budgetService: BudgetService,
    ) {}

    async AddMovement(): Promise<void> {
        try {
            this.MovementFormData.Submitting = true
            console.log(this.MovementFormData)
            this.MovementFormData.Submitting = false
        } catch (error) {
            this.MovementFormData.Submitting = false
            this.MovementFormData.Error = true
        }
    }
}
