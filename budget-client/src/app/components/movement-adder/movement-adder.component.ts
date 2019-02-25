import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { FormControl, NgForm, Validators } from '@angular/forms'

import { DateTime } from 'luxon'

import { Budget, BudgetStatus, Category, CategoryType, Months, Period } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-movement-adder',
    templateUrl: './movement-adder.component.html',
    styleUrls: ['./movement-adder.component.scss'],
})
export class MovementAdderComponent implements OnInit {
    BudgetStatus = BudgetStatus
    CategoryType = CategoryType
    Months = Months

    @Input() Budgets: Budget[]
    Categories: Category[][] = new Array<Category[]>(CategoryType.CategoryTypeCount)

    MovementFormData = {
        Submitting: false,
        Sign: '-1',
        Amount: '',
        AmountFormControl: new FormControl('', [
            Validators.required,
        ]),
        BudgetID: '',
        Category: <Category><unknown>undefined,
        CategoryEmpty: false,
        Period: 0,
        Year: 0,
        Month: 0,
    }

    @ViewChild('f') form: NgForm;

    constructor(
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        const now = DateTime.local()
        this.MovementFormData.Year = now.year
        this.MovementFormData.Month = now.month

        for (let i = 0; i < this.Categories.length; i += 1) {
            this.Categories[i] = []
        }

        for (const budget of this.Budgets) {
            if (budget.Status === BudgetStatus.Main) {
                this.MovementFormData.BudgetID = budget.ID
                for (const category of budget.Categories) {
                    this.Categories[category.Type].push(category)
                }
            }
        }
    }

    CheckAmount(event: any): void {
        let newValue: string = event.target.value

        newValue = newValue.replace(/[^0-9,.]/g, "")
        newValue = newValue.replace(/,/g, '.')
        const splited = newValue.split('.')
        switch (splited.length) {
        case 0:
            newValue = ''
            break
        case 1:
            newValue = splited[0]
            break
        default:
            if (splited[0] === '') {
                newValue = ''
            } else {
                newValue = `${splited[0]}.${splited[1].slice(0, 2)}`
            }
            break
        }

        this.MovementFormData.Amount = newValue
        event.target.value = newValue
    }

    SetCategory(category: Category): void {
        this.MovementFormData.Category = category
    }

    Submit(): void {
        this.form.ngSubmit.emit()
    }

    async AddMovement(): Promise<void> {
        if (this.MovementFormData.Category == undefined) {
            this.MovementFormData.CategoryEmpty = true
            return
        }

        if (this.MovementFormData.AmountFormControl.hasError('required')) {
            return
        }

        try {
            this.MovementFormData.Submitting = true
            console.log(this.MovementFormData)
            this.MovementFormData.Submitting = false
        } catch (error) {
            this.MovementFormData.Submitting = false
            await this.errorService.DisplayError()
        }
    }
}
