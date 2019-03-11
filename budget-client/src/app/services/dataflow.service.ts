import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { Account, Budget, BudgetStatus, CategoryType, Category, Movement, RecurringMovement, Month } from '../domain/domain'

import { BudgetService } from './budget.service'
import { Period, PeriodDuration, PeriodService } from './period.service'

const orderBudget = (a: Budget, b: Budget): number => {
    if (a.Status === BudgetStatus.Main) {
        return -1
    } else if (b.Status === BudgetStatus.Main) {
        return 1
    }

    if (a.Status === BudgetStatus.Open) {
        return -1
    } else if (b.Status === BudgetStatus.Open) {
        return 1
    }

    if (a.Status === BudgetStatus.NotAccepted) {
        return -1
    } else if (b.Status === BudgetStatus.NotAccepted) {
        return 1
    }

    return 0
}

@Injectable({
    providedIn: 'root',
})
export class DataflowService {
    Account: BehaviorSubject<Account>
    SelectedBudget: BehaviorSubject<Budget>
    Movements: BehaviorSubject<Movement[]>
    RecurringMovements: BehaviorSubject<RecurringMovement[]>

    private period: Period

    constructor(
        private readonly budgetService: BudgetService,
        private readonly periodService: PeriodService,
    ) {}

    async Init(): Promise<void> {
        this.Movements = new BehaviorSubject([])
        this.RecurringMovements = new BehaviorSubject([])

        const account = await this.budgetService.GetAcount()
        account.Budgets.sort(orderBudget)
        this.Account = new BehaviorSubject(account)

        this.SelectedBudget = new BehaviorSubject(account.Budgets[0])

        this.periodService.PeriodChange.subscribe(async (period) => {
            this.period = period
            await this.getMovements()
        })
    }

    OpenBudgets(): Budget[] {
        const account = this.Account.value
        const openBudgets: Budget[] = []
        for (const budget of account.Budgets) {
            if (budget.Status === BudgetStatus.Main || budget.Status === BudgetStatus.Open) {
                openBudgets.push(budget)
            }
        }
        return openBudgets
    }

    SelectBudget(budgetID: string): void {
        const account = this.Account.value
        for (const budget of account.Budgets) {
            if (budget.ID === budgetID) {
                this.SelectedBudget.next(budget)
                break
            }
        }
    }

    private async getMovements(): Promise<void> {
        this.Movements.next([])
        this.RecurringMovements.next([])

        const budgetID = this.SelectedBudget.value.ID
        const period = Object.assign(new Period(), this.period)

        let year: number | undefined = undefined
        let month: Month | undefined = undefined

        switch (period.Duration) {
        case PeriodDuration.Year:
            year = period.Year
            break
        case PeriodDuration.Month:
            year = period.Year
            month = period.Month
            break
        }

        try {
            const movements = await Promise.all([
                this.budgetService.GetMovements(budgetID, year, month), 
                this.budgetService.GetRecurringMovements(budgetID, year, month),
            ])

            if (budgetID === this.SelectedBudget.value.ID && period.Equals(this.period)) {
                this.Movements.next(movements[0])
                this.RecurringMovements.next(movements[1])
            }
        } catch (error) {
        }
    }

    async AddJointBudget(email: string): Promise<void> {
        const budget = await this.budgetService.AddJointBudget(email)

        const account = this.Account.value
        account.Budgets.push(budget)
        account.Budgets.sort(orderBudget)
        this.Account.next(account)
    }

    async AcceptJointBudget(budgetID: string): Promise<void> {
        await this.budgetService.AcceptJointBudget(budgetID)

        const account = this.Account.value
        for (const budget of account.Budgets) {
            if (budget.ID === budgetID) {
                budget.Status = BudgetStatus.Open
                break
            }
        }
        account.Budgets.sort(orderBudget)
        this.Account.next(account)
    }

    async DisableJointBudget(budgetID: string): Promise<void> {
        await this.budgetService.DisableJointBudget(budgetID)

        const account = this.Account.value
        for (let i = 0; i < account.Budgets.length; i += 1) {
            if (budgetID === account.Budgets[i].ID) {
                account.Budgets.splice(i, 1)
                break
            }
        }
        account.Budgets.sort(orderBudget)
        this.Account.next(account)
    }

    async AddCategory(budgetID: string, type: CategoryType, name: string): Promise<Category> {
        const category = await this.budgetService.AddCategory(budgetID, type, name)

        const account = this.Account.value
        for (const budget of account.Budgets) {
            if (budget.ID === budgetID) {
                budget.Categories.push(category)
                this.SelectedBudget.next(budget)
                this.Account.next(account)
                break
            }
        }

        return category
    }

    async UpdateCategory(categoryID: string, name: string): Promise<void> {
        await this.budgetService.UpdateCategory(categoryID, name)

        const account = this.Account.value
        loop:
        for (const budget of account.Budgets) {
            for (const category of budget.Categories) {
                if (category.ID === categoryID) {
                    category.Name = name
                    this.SelectedBudget.next(budget)
                    this.Account.next(account)
                    break loop
                }
            }
        }
    }

    async DeleteCategory(categoryID: string): Promise<void> {
        await this.budgetService.DeleteCategory(categoryID)

        const account = this.Account.value
        loop:
        for (const budget of account.Budgets) {
            for (let i = 0; i < budget.Categories.length; i++) {
                if (budget.Categories[i].ID === categoryID) {
                    budget.Categories.splice(i, 1)
                    this.SelectedBudget.next(budget)
                    this.Account.next(account)
                    break loop
                }
            }
        }
    }

    async AddMovement(categoryID: string, amount: number, year: number, month: number): Promise<void> {
        const movement = await this.budgetService.AddMovement(categoryID, amount, year, month)
        if (isMovementInPeriod(movement, this.period)) {
            const movements = this.Movements.value
            movements.push(movement)
            this.Movements.next(movements)
        }
    }

    async UpdateMovement(movementID: string, categoryID: string, year: number, month: number): Promise<void> {
        await this.budgetService.UpdateMovement(movementID, categoryID, year, month)
    }

    async DeleteMovement(movementID: string): Promise<void> {
        await this.budgetService.DeleteMovement(movementID)
        const movements = this.Movements.value
        for (let i = 0; i < movements.length; i++) {
            if (movements[i].ID === movementID) {
                movements.splice(i, 1)
                this.Movements.next(movements)
                break
            }
        }
    }

    async AddRecurringMovement(categoryID: string, amount: number, firstYear: number, firstMonth: number): Promise<void> {
        const movement = await this.budgetService.AddRecurringMovement(categoryID, amount, firstYear, firstMonth)
        if (isRecurringMovementInPeriod(movement, this.period)) {
            const movements = this.RecurringMovements.value
            movements.push(movement)
            this.RecurringMovements.next(movements)
        }
    }

    async UpdateRecurringMovement(movementID: string, categoryID: string, firstYear: number, firstMonth: number, lastYear: number, lastMonth: number): Promise<void> {
        await this.budgetService.UpdateRecurringMovement(movementID, categoryID, firstYear, firstMonth, lastYear, lastMonth)
    }

    async DeleteRecurringMovement(movementID: string): Promise<void> {
        await this.budgetService.DeleteRecurringMovement(movementID)
        const movements = this.RecurringMovements.value
        for (let i = 0; i < movements.length; i++) {
            if (movements[i].ID === movementID) {
                movements.splice(i, 1)
                this.RecurringMovements.next(movements)
                break
            }
        }
    }
}

function isMovementInPeriod(movement: Movement, period: Period): boolean {
    switch (period.Duration) {
    case PeriodDuration.All:
        return true
    case PeriodDuration.Year:
        return movement.Year === period.Year
    case PeriodDuration.Month:
        return movement.Year === period.Year && (movement.Month === Month.All || movement.Month === movement.Month)
    }
}

function isRecurringMovementInPeriod(movement: RecurringMovement, period: Period): boolean {
    switch (period.Duration) {
    case PeriodDuration.All:
        return true
    case PeriodDuration.Year:
        return movement.FirstYear <= period.Year && period.Year <= movement.LastYear
    case PeriodDuration.Month:
        return (movement.FirstYear < period.Year || (movement.FirstYear === period.Year && (movement.FirstMonth === Month.All || movement.FirstMonth <= period.Month))) && (period.Year < movement.LastYear || (movement.LastYear === period.Year && (movement.LastMonth === Month.All || period.Month <= movement.LastMonth)))
    }
}
