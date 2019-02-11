import { Injectable } from '@angular/core'

import { HttpWrapperService } from './http-wrapper.service'

@Injectable({
    providedIn: 'root',
})
export class BudgetService {
    constructor(
        private readonly http: HttpWrapperService,
    ) {}

    async GetAcount(): Promise<void> {
        await this.http.get<void>('/api/account')
    }

    async UpdateAcount(name: string): Promise<void> {
        await this.http.post<void>('/api/account', {
            Name: name,
        })
    }

    async AddJointBudget(email: string): Promise<void> {
        await this.http.post<void>('/api/budget', {
            Email: email,
        })
    }

    async AcceptJointBudget(budgetID: string): Promise<void> {
        await this.http.post<void>(`/api/budget/${budgetID}`, {})
    }

    async DisableJointBudget(budgetID: string): Promise<void> {
        await this.http.delete<void>(`/api/budget/${budgetID}`)
    }

    async AddCategory(budgetID: string, name: string): Promise<void> {
        await this.http.post<void>('/api/category', {
            BudgetID: budgetID,
            Name: name,
        })
    }

    async UpdateCategory(categoryID: string, name: string): Promise<void> {
        await this.http.post<void>(`/api/category/${categoryID}`, {
            Name: name,
        })
    }

    async DeleteCategory(categoryID: string): Promise<void> {
        await this.http.delete<void>(`/api/category/${categoryID}`)
    }

    async AddMovement(categoryID: string, amount: number, year: number, month: number): Promise<void> {
        await this.http.post<void>('/api/movement', {
            Category: categoryID,
            Amount: amount,
            Year: year,
            Month: month,
        })
    }

    async UpdateMovement(movementID: string, categoryID: string, year: number, month: number): Promise<void> {
        await this.http.post<void>(`/api/movement/${movementID}`, {
            Category: categoryID,
            Year: year,
            Month: month,
        })
    }

    async DeleteMovement(movementID: string): Promise<void> {
        await this.http.delete<void>(`/api/movement/${movementID}`)
    }

    async AddRecurringMovement(categoryID: string, amount: number, period: number, firstYear: number, firstMonth: number): Promise<void> {
        await this.http.post<void>('/api/recurring_movement', {
            Category: categoryID,
            Amount: amount,
            Period: period,
            FirstYear: firstYear,
            FirstMonth: firstMonth,
        })
    }

    async UpdateRecurringMovement(movementID: string, categoryID: string, firstYear: number, firstMonth: number, lastYear: number, lastMonth: number): Promise<void> {
        await this.http.post<void>(`/api/recurring_movement/${movementID}`, {
            Category: categoryID,
            FirstYear: firstYear,
            FirstMonth: firstMonth,
            LastYear: lastYear,
            LastMonth: lastMonth,
        })
    }

    async DeleteRecurringMovement(movementID: string): Promise<void> {
        await this.http.delete<void>(`/api/recurring_movement/${movementID}`)
    }
}
