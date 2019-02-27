import { Component, Input, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { DateTime } from 'luxon'

import { Budget, BudgetStatus, Category, CategoryType, CategoryTypes, Months } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'

enum FormPeriod { OneTime, OverTheYear, Monthly, Yearly }

@Component({
    selector: 'app-movement-adder',
    templateUrl: './movement-adder.component.html',
    styleUrls: ['./movement-adder.component.scss'],
})
export class MovementAdderComponent implements OnInit {
    BudgetStatus = BudgetStatus
    CategoryType = CategoryType
    CategoryTypes = CategoryTypes
    FormPeriod = FormPeriod
    Months = Months

    @Input() Budgets: Budget[]
    Categories: Category[][] = new Array<Category[]>(CategoryType.CategoryTypeCount)

    MovementFormData = {
        Sign: '-1',
        Amount: '',
        AmountFormControl: new FormControl('', [
            Validators.required,
        ]),
        BudgetID: '',
        Category: undefined as unknown as Category,
        CategoryEmpty: false,
        Period: FormPeriod.OneTime,
        Year: 0,
        Month: 0,
    }

    constructor(
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        this.resetDate()
        this.setBudgetMain()
    }

    private setBudgetMain(): void {
        for (const budget of this.Budgets) {
            if (budget.Status === BudgetStatus.Main) {
                this.MovementFormData.BudgetID = budget.ID
            }
        }
        this.setCategories(this.MovementFormData.BudgetID)
    }

    private setCategories(budgetID: string): void {
        for (let i = 0; i < this.Categories.length; i += 1) {
            this.Categories[i] = []
        }

        for (const budget of this.Budgets) {
            if (budget.ID === budgetID) {
                for (const category of budget.Categories) {
                    this.Categories[category.Type].push(category)
                }
            }
        }

        this.MovementFormData.Category = undefined as unknown as Category
        this.MovementFormData.CategoryEmpty = false
    }

    private resetDate(): void {
        const now = DateTime.local()
        this.MovementFormData.Year = now.year
        this.MovementFormData.Month = now.month
    }

    private resetMonth(): void {
        const now = DateTime.local()
        this.MovementFormData.Month = now.month
    }

    SignChanged(sign: string): void {
        this.setBudgetMain()

        this.MovementFormData.Period = FormPeriod.OneTime
        this.resetDate()
    }

    BudgetChanged(budgetID: string): void {
        this.setCategories(budgetID)
    }

    CheckAmount(event: any): void {
        let newValue: string = event.target.value

        newValue = newValue.replace(/[^0-9,.]/g, '')
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

    PeriodChanged(period: number): void {
        if (period === FormPeriod.OverTheYear || period === FormPeriod.Yearly) {
            this.MovementFormData.Month = 0
        } else if (this.MovementFormData.Month === 0) {
            this.resetMonth()
        }
    }

    async AddMovement(): Promise<void> {
        this.MovementFormData.AmountFormControl.markAsTouched()

        if (this.MovementFormData.Category == undefined) {
            this.MovementFormData.CategoryEmpty = true
            return
        }

        if (this.MovementFormData.AmountFormControl.hasError('required')) {
            return
        }

        try {
            console.log(this.MovementFormData)
        } catch (error) {
            await this.errorService.DisplayError()
        }
    }
}
