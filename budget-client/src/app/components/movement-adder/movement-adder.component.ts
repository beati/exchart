import { Component, Input, OnInit } from '@angular/core'

import { DateTime } from 'luxon'

import { Account, BudgetStatus, Category, Months, Period } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-movement-adder',
    templateUrl: './movement-adder.component.html',
    styleUrls: ['./movement-adder.component.scss'],
})
export class MovementAdderComponent implements OnInit {
    @Input() Account: Account
    Months = Months
    Categories: Category[]

    MovementFormData = {
        Submitting: false,
        Error: false,
        Sign: '-1',
        Amount: 0,
        BudgetID: '',
        CategoryID: '',
        Period: 0,
        Year: 0,
        Month: 0,
    }

    constructor(
        private readonly budgetService: BudgetService,
    ) {}

    ngOnInit(): void {
        const now = DateTime.local()
        this.MovementFormData.Year = now.year
        this.MovementFormData.Month = now.month

        for (let i = 0; i < this.Account.Budgets.length; i++) {
            const budget = this.Account.Budgets[i]
            if (budget.Status === BudgetStatus.Main) {
                this.MovementFormData.BudgetID = budget.ID
                this.Categories = budget.Categories
            }
        }
    }

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
