import { Injectable } from '@angular/core'

import { BehaviorSubject } from 'rxjs'

import { Account, Budget, BudgetStatus, CategoryType, Category, Movement, RecurringMovement } from '../domain/domain'

import { BudgetService } from './budget.service'
import { Period, PeriodService } from './period.service'

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
    Movements: BehaviorSubject<Movement>
    RecurringMovements: BehaviorSubject<RecurringMovement>

    private period: Period

    constructor(
        private readonly budgetService: BudgetService,
        private readonly periodService: PeriodService,
    ) {
        this.period = this.periodService.PeriodChange.value
        this.periodService.PeriodChange.subscribe((period) => {
            this.period = period
        })
    }

    async Init(): Promise<void> {
        const account = await this.budgetService.GetAcount()
        account.Budgets.sort(orderBudget)
        this.Account = new BehaviorSubject(account)

        this.SelectedBudget = new BehaviorSubject(account.Budgets[0])
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
                break
            }
        }
        this.Account.next(account)

        return category
    }

    async UpdateCategory(categoryID: string, name: string): Promise<void> {
        await this.budgetService.UpdateCategory(categoryID, name)
    }

    async DeleteCategory(categoryID: string): Promise<void> {
        await this.budgetService.DeleteCategory(categoryID)
    }
}
