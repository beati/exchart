import { Injectable } from '@angular/core'

import { HttpWrapperService } from './http-wrapper.service'

import { Account, Movement, Month } from '../domain/domain'

@Injectable({
    providedIn: 'root',
})
export class BudgetService {
    constructor(
        private readonly http: HttpWrapperService,
    ) {}

    async GetAcount(): Promise<Account> {
        return this.http.get<Account>('/api/account')
    }

    async UpdateAcount(name: string): Promise<void> {
        return this.http.post<void>('/api/account', {
            Name: name,
        })
    }

    async AddJointBudget(email: string): Promise<void> {
        return this.http.post<void>('/api/budget', {
            Email: email,
        })
    }

    async AcceptJointBudget(budgetID: string): Promise<void> {
        return this.http.post<void>(`/api/budget/${budgetID}`, {})
    }

    async DisableJointBudget(budgetID: string): Promise<void> {
        return this.http.delete<void>(`/api/budget/${budgetID}`)
    }

    async AddCategory(budgetID: string, name: string): Promise<void> {
        return this.http.post<void>('/api/category', {
            BudgetID: budgetID,
            Name: name,
        })
    }

    async UpdateCategory(categoryID: string, name: string): Promise<void> {
        return this.http.post<void>(`/api/category/${categoryID}`, {
            Name: name,
        })
    }

    async DeleteCategory(categoryID: string): Promise<void> {
        return this.http.delete<void>(`/api/category/${categoryID}`)
    }

    async GetMovements(budgetID: string, year?: number, month?: Month): Promise<Movement[]> {
        let queryParams = ''
        if (year != undefined) {
            queryParams += `?year=${year}`
        }
        if (month != undefined) {
            queryParams += `&month=${month}`
        }
        return this.http.get<Movement[]>(`/api/movement/${budgetID}${queryParams}`)
    }

    async AddMovement(categoryID: string, amount: number, year: number, month: number): Promise<void> {
        return this.http.post<void>('/api/movement', {
            Category: categoryID,
            Amount: amount,
            Year: year,
            Month: month,
        })
    }

    async UpdateMovement(movementID: string, categoryID: string, year: number, month: number): Promise<void> {
        return this.http.post<void>(`/api/movement/${movementID}`, {
            Category: categoryID,
            Year: year,
            Month: month,
        })
    }

    async DeleteMovement(movementID: string): Promise<void> {
        return this.http.delete<void>(`/api/movement/${movementID}`)
    }

    async GetRecurringMovements(year?: number, month?: Month): Promise<void> {
    }

    async AddRecurringMovement(categoryID: string, amount: number, period: number, firstYear: number, firstMonth: number): Promise<void> {
        return this.http.post<void>('/api/recurring_movement', {
            Category: categoryID,
            Amount: amount,
            Period: period,
            FirstYear: firstYear,
            FirstMonth: firstMonth,
        })
    }

    async UpdateRecurringMovement(movementID: string, categoryID: string, firstYear: number, firstMonth: number, lastYear: number, lastMonth: number): Promise<void> {
        return this.http.post<void>(`/api/recurring_movement/${movementID}`, {
            Category: categoryID,
            FirstYear: firstYear,
            FirstMonth: firstMonth,
            LastYear: lastYear,
            LastMonth: lastMonth,
        })
    }

    async DeleteRecurringMovement(movementID: string): Promise<void> {
        return this.http.delete<void>(`/api/recurring_movement/${movementID}`)
    }
}
