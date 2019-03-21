import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { Account, Budget, BudgetStatus, Category, CategoryType, Month, Movement, RecurringMovement } from '../domain/domain'

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

const isMovementInPeriod = (movement: Movement, period: Period): boolean => {
    switch (period.Duration) {
    case PeriodDuration.All:
        return true
    case PeriodDuration.Year:
        return movement.Year === period.Year
    case PeriodDuration.Month:
        return movement.Year === period.Year && (movement.Month === Month.All || movement.Month === movement.Month)
    }
}

const isRecurringMovementInPeriod = (movement: RecurringMovement, period: Period): boolean => {
    switch (period.Duration) {
    case PeriodDuration.All:
        return true
    case PeriodDuration.Year:
        return movement.FirstYear <= period.Year && (movement.LastYear === 0 || period.Year <= movement.LastYear)
    case PeriodDuration.Month:
        return (movement.FirstYear < period.Year || (movement.FirstYear === period.Year && (movement.FirstMonth === Month.All || movement.FirstMonth <= period.Month))) && (movement.LastYear === 0 || period.Year < movement.LastYear || (movement.LastYear === period.Year && (movement.LastMonth === Month.All || period.Month <= movement.LastMonth)))
    }
}

export type MovementEventType = 'loading' | 'error' | 'loaded'

export interface MovementsEvent {
    Type: MovementEventType
    Movements: Movement[]
}

export interface RecurringMovementsEvent {
    Type: MovementEventType
    Movements: RecurringMovement[]
}

@Injectable({
    providedIn: 'root',
})
export class DataflowService {
    Account: BehaviorSubject<Account>
    SelectedBudget: BehaviorSubject<Budget | undefined>
    Movements: BehaviorSubject<MovementsEvent>
    RecurringMovements: BehaviorSubject<RecurringMovementsEvent>

    private resetBudget = false
    private period: Period

    constructor(
        private readonly budgetService: BudgetService,
        private readonly periodService: PeriodService,
    ) {}

    async Init(): Promise<void> {
        this.Movements = new BehaviorSubject<MovementsEvent>({
            Type: 'loading',
            Movements: [],
        })
        this.RecurringMovements = new BehaviorSubject<RecurringMovementsEvent>({
            Type: 'loading',
            Movements: [],
        })

        const account = await this.budgetService.GetAcount()
        account.Budgets.sort(orderBudget)
        this.Account = new BehaviorSubject(account)

        this.SelectedBudget = new BehaviorSubject(undefined)

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

    async SelectBudget(budgetID: string): Promise<void> {
        if (budgetID === '') {
            this.resetBudget = true
            return
        }

        let newBudget: Budget | undefined
        const account = this.Account.value
        for (const budget of account.Budgets) {
            if (budget.ID === budgetID) {
                newBudget = budget
                break
            }
        }

        let isNew = false
        const previousBudget = this.SelectedBudget.value
        if (newBudget == undefined && previousBudget != undefined) {
            isNew = true
        } else if (newBudget != undefined && (previousBudget == undefined || (newBudget.ID !== previousBudget.ID))) {
            isNew = true
        }

        if (isNew || this.resetBudget) {
            this.SelectedBudget.next(newBudget)
            return this.getMovements()
        }
        this.resetBudget = false
    }

    private async getMovements(): Promise<void> {
        this.Movements.next({
            Type: 'loading',
            Movements: [],
        })
        this.RecurringMovements.next({
            Type: 'loading',
            Movements: [],
        })

        const period = Object.assign(new Period(), this.period)
        let year: number | undefined
        let month: Month | undefined
        switch (period.Duration) {
        case PeriodDuration.Year:
            year = period.Year
            break
        case PeriodDuration.Month:
            year = period.Year
            month = period.Month
            break
        }

        const movementRequests: Promise<Movement[]>[] = []
        const recurringMovementRequests: Promise<RecurringMovement[]>[] = []

        const requestedBudget = this.SelectedBudget.value
        if (requestedBudget == undefined) {
            for (const budget of this.OpenBudgets()) {
                movementRequests.push(this.budgetService.GetMovements(budget.ID, year, month))
                recurringMovementRequests.push(this.budgetService.GetRecurringMovements(budget.ID, year, month))
            }
        } else {
            const budgetID = requestedBudget.ID
            movementRequests.push(this.budgetService.GetMovements(budgetID, year, month))
            recurringMovementRequests.push(this.budgetService.GetRecurringMovements(budgetID, year, month))
        }

        try {
            const results = await Promise.all([
                Promise.all(movementRequests),
                Promise.all(recurringMovementRequests),
            ])

            const selectedBudget = this.SelectedBudget.value
            let budgetNotChanged = false
            if (requestedBudget == undefined && selectedBudget == undefined) {
                budgetNotChanged = true
            } else if (requestedBudget != undefined && selectedBudget != undefined && requestedBudget.ID === selectedBudget.ID) {
                budgetNotChanged = true
            }

            if (budgetNotChanged && period.Equals(this.period)) {
                let movements: Movement[] = []
                for (const movementSet of results[0]) {
                    movements = movements.concat(movementSet)
                }

                let recurringMovement: RecurringMovement[] = []
                for (const movementSet of results[1]) {
                    recurringMovement = recurringMovement.concat(movementSet)
                }

                this.Movements.next({
                    Type: 'loaded',
                    Movements: movements,
                })
                this.RecurringMovements.next({
                    Type: 'loaded',
                    Movements: recurringMovement,
                })
            }
        } catch (error) {
            this.Movements.next({
                Type: 'error',
                Movements: [],
            })
            this.RecurringMovements.next({
                Type: 'error',
                Movements: [],
            })
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
            for (let i = 0; i < budget.Categories.length; i += 1) {
                if (budget.Categories[i].ID === categoryID) {
                    budget.Categories.splice(i, 1)
                    this.SelectedBudget.next(budget)
                    this.Account.next(account)
                    break loop
                }
            }
        }
    }

    async AddMovement(budgetID: string, categoryID: string, amount: number, year: number, month: number): Promise<void> {
        const movement = await this.budgetService.AddMovement(categoryID, amount, year, month)
        const selectedBudget = this.SelectedBudget.value
        const movementsEvent = this.Movements.value
        if (movementsEvent.Type === 'loaded' && (selectedBudget == undefined || budgetID === selectedBudget.ID) && isMovementInPeriod(movement, this.period)) {
            movementsEvent.Movements.push(movement)
            this.Movements.next(movementsEvent)
        }
    }

    async DeleteMovement(movementID: string): Promise<void> {
        await this.budgetService.DeleteMovement(movementID)
        const movementsEvent = this.Movements.value
        if (movementsEvent.Type === 'loaded') {
            const movements = movementsEvent.Movements
            for (let i = 0; i < movements.length; i += 1) {
                if (movements[i].ID === movementID) {
                    movements.splice(i, 1)
                    this.Movements.next(movementsEvent)
                    break
                }
            }
        }
    }

    async AddRecurringMovement(budgetID: string, categoryID: string, amount: number, firstYear: number, firstMonth: number): Promise<void> {
        const movement = await this.budgetService.AddRecurringMovement(categoryID, amount, firstYear, firstMonth)
        const selectedBudget = this.SelectedBudget.value
        const movementsEvent = this.RecurringMovements.value
        if (movementsEvent.Type === 'loaded' && (selectedBudget == undefined || budgetID === selectedBudget.ID) && isRecurringMovementInPeriod(movement, this.period)) {
            movementsEvent.Movements.push(movement)
            this.RecurringMovements.next(movementsEvent)
        }
    }

    async DeleteRecurringMovement(movementID: string): Promise<void> {
        await this.budgetService.DeleteRecurringMovement(movementID)
        const movementsEvent = this.RecurringMovements.value
        if (movementsEvent.Type === 'loaded') {
            const movements = movementsEvent.Movements
            for (let i = 0; i < movements.length; i += 1) {
                if (movements[i].ID === movementID) {
                    movements.splice(i, 1)
                    this.RecurringMovements.next(movementsEvent)
                    break
                }
            }
        }
    }

    async UpdateRecurringMovement(movementID: string, lastYear: number, lastMonth: number): Promise<void> {
        await this.budgetService.UpdateRecurringMovement(movementID, lastYear, lastMonth)
        const movementsEvent = this.RecurringMovements.value
        if (movementsEvent.Type === 'loaded') {
            const movements = movementsEvent.Movements
            for (let i = 0; i < movements.length; i += 1) {
                if (movements[i].ID === movementID) {
                    movements[i].LastYear = lastYear
                    movements[i].LastMonth = lastMonth
                    this.RecurringMovements.next(movementsEvent)
                    break
                }
            }
        }
    }
}
