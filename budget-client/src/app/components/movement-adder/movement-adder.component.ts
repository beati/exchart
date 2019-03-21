import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'

import { DateTime } from 'luxon'

import { Budget, BudgetStatus, Category, CategoryType, CategoryTypes, Months } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

enum FormPeriod { Monthly, Yearly, OneTime, OverTheYear }

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

    Budgets: Budget[]
    Categories: Category[][] = new Array<Category[]>(CategoryType.CategoryTypeCount)

    MovementFormData = {
        Sign: '-1',
        AmountFormControl: new FormControl('', [
            Validators.required,
        ]),
        BudgetID: '',
        Category: undefined as Category | undefined,
        CategoryEmpty: false,
        Period: FormPeriod.OneTime,
        Year: 0,
        Month: 0,
    }

    constructor(
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        this.Budgets = this.dataflowService.OpenBudgets()
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

        this.MovementFormData.Category = undefined
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
        if (sign === '1') {
            this.MovementFormData.Category = this.Categories[0][0]
        }
        this.MovementFormData.Period = FormPeriod.OneTime
        this.resetDate()
    }

    BudgetChanged(budgetID: string): void {
        this.setCategories(budgetID)
    }

    CheckAmount(event: any): void {
        if (event == undefined || event.target == undefined) {
            return
        }
        const newValueAny = event.target.value
        if (typeof newValueAny !== 'string') {
            return
        }

        let newValue = newValueAny
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
                const digitsCount = 2
                newValue = `${splited[0]}.${splited[1].slice(0, digitsCount)}`
            }
            break
        }

        this.MovementFormData.AmountFormControl.setValue(newValue)
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

    async AddMovement(): Promise<boolean> {
        this.MovementFormData.AmountFormControl.markAsTouched()

        if (this.MovementFormData.Category == undefined) {
            this.MovementFormData.CategoryEmpty = true
            return false
        }

        if (this.MovementFormData.AmountFormControl.hasError('required')) {
            return false
        }

        try {
            let amountString = this.MovementFormData.AmountFormControl.value as string
            if (amountString.slice(-1) === '.') {
                amountString = `${amountString}0`
            }

            let amount = parseFloat(amountString)
            const centFactor = 100
            amount *= centFactor
            if (this.MovementFormData.Sign === '-1') {
                amount = -amount
            }

            switch (this.MovementFormData.Period) {
            case FormPeriod.OneTime:
            case FormPeriod.OverTheYear:
                await this.dataflowService.AddMovement(
                    this.MovementFormData.BudgetID,
                    this.MovementFormData.Category.ID,
                    amount,
                    this.MovementFormData.Year,
                    this.MovementFormData.Month,
                )
                break
            case FormPeriod.Monthly:
            case FormPeriod.Yearly:
                await this.dataflowService.AddRecurringMovement(
                    this.MovementFormData.BudgetID,
                    this.MovementFormData.Category.ID,
                    amount,
                    this.MovementFormData.Year,
                    this.MovementFormData.Month,
                )
                break
            }
        } catch (error) {
            await this.errorService.DisplayError()
            return false
        }
        return true
    }
}
