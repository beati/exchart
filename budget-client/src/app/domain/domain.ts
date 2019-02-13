export interface Account {
    Name: string
    Budgets: Budget[]
}

export enum BudgetStatus { Main, Open, ToAccept, NotAccepted }

export interface Budget {
    ID: string
    Status: BudgetStatus
    With: string
    Categories: Category[]
}

export enum CategoryType { Transport, House, CategoryTypeCount }

export interface Category {
    ID: string
    Type: CategoryType
    Name: string
}

export enum Month { All, January }

export interface Movement {
    ID: string
    CategoryID: string
    Amount: number
    Year: number
    Month: Month
}

export enum Period { Monthly, Yearly }

export interface RecurringMovement {
    ID: string
    CategoryID: string
    Amount: number
    Period: Period
    FirstYear: number
    LastYear: number
    FirstMonth: Month
    LastMonth: Month
}
