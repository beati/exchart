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

export enum CategoryType { Housing, Transport, CategoryTypeCount }

export interface Category {
    ID: string
    Type: CategoryType
    Name: string
}

export enum Month { All, January, February, March, April, May, June, July, August, September, October, November, December }

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

export const Months = [
    { Code: Month.January, String: 'Januray' },
    { Code: Month.February, String: 'February' },
    { Code: Month.March, String: 'March' },
    { Code: Month.April, String: 'April' },
    { Code: Month.May, String: 'May' },
    { Code: Month.June, String: 'June' },
    { Code: Month.July, String: 'July' },
    { Code: Month.August, String: 'August' },
    { Code: Month.September, String: 'September' },
    { Code: Month.October, String: 'October' },
    { Code: Month.November, String: 'November' },
    { Code: Month.December, String: 'December' },
]
