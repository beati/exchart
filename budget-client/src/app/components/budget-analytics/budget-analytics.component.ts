import { Component, OnDestroy, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { TranslateService } from '@ngx-translate/core'

import { Account, Budget, BudgetStatus, Category, CategoryType, CategoryTypes, Months, RecurringMovement } from '../../domain/domain'

import { Period, PeriodDuration, PeriodService } from '../../services/period.service'
import { DataflowService, EventType, MovementsEvent, RecurringMovementsEvent } from '../../services/dataflow.service'

interface categoryAmount {
    Category: Category
    Amount: number
    Ratio: number
}

interface categoryRef {
    category: Category
    main: boolean
}

const isMonthInMovement = (movement: RecurringMovement, year: number, month: number): boolean => {
    if (movement.FirstYear === year && month < movement.FirstMonth) {
            return false
    } else if (movement.LastYear === year && movement.LastMonth < month) {
            return false
    }
    return true
}

@Component({
    selector: 'app-budget-analytics',
    templateUrl: './budget-analytics.component.html',
    styleUrls: ['./budget-analytics.component.scss'],
})
export class BudgetAnalyticsComponent implements OnInit, OnDestroy {
    CategoryTypes = CategoryTypes
    PeriodDuration = PeriodDuration

    private readonly categoryTypeLabels: string[] = []

    private account: Account | undefined
    private accountEventSub: Subscription
    private categories: Map<string, categoryRef>

    Budget: Budget | undefined
    private budgetSub: Subscription

    Period: Period

    private movementsEvent: MovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private movementsEventSub: Subscription
    private recurringMovementEvent: RecurringMovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private recurringMovementsEventSub: Subscription

    LoadingState: EventType = 'loading'

    Incomes = 0
    Expenses = 0
    Balance = 0
    Provision = 0

    CategoryAmountColumns = ['Type', 'Category', 'Amount', 'Ratio']
    CategoryAmounts: categoryAmount[] = []

    CategoryTypeAmountsChartData: Chartist.IChartistData
    CategoryTypeAmountsChartOptions: Chartist.IPieChartOptions = {
        donut: true,
    }

    MonthsBalanceChartData: Chartist.IChartistData
    MonthsBalanceChartOptions: Chartist.ILineChartOptions = {
        fullWidth: true,
        chartPadding: {
            right: 60,
        },
    }

    constructor(
        private readonly translate: TranslateService,
        private readonly periodService: PeriodService,
        private readonly dataflowService: DataflowService,
    ) {}

    async ngOnInit(): Promise<void> {
        const monthsTranslations = (await this.translate.get('Months').toPromise()) as { [type: string]: string }
        const labels: string[] = []
        const series: number[][] = [[]]
        for (const month of Months) {
            labels.push(monthsTranslations[month.String])
            series[0].push(0)
        }
        this.MonthsBalanceChartData = {
            labels: labels,
            series: series,
        }

        const categoryTypeTranslations = (await this.translate.get('CategoryTypes').toPromise()) as { [type: string]: string }
        for (const type of CategoryTypes) {
            this.categoryTypeLabels.push(categoryTypeTranslations[type])
        }

        this.Period = this.periodService.PeriodChange.value

        this.accountEventSub = this.dataflowService.Account.subscribe((accountEvent) => {
            if (accountEvent.Type === 'loaded') {
                this.account = accountEvent.Account
                if (this.account === undefined) {
                    return
                }
                
                this.categories = new Map<string, categoryRef>()
                for (const budget of this.account.Budgets) {
                    for (const category of budget.Categories) {
                        this.categories.set(category.ID, {
                            category: category,
                            main: budget.Status === BudgetStatus.Main,
                        })
                    }
                }
            } else {
                this.account = undefined
            }
            this.init()
        })

        this.budgetSub = this.dataflowService.SelectedBudget.subscribe((budget) => {
            this.Budget = budget
            this.init()
        })

        this.movementsEventSub = this.dataflowService.Movements.subscribe((movementsEvent) => {
            this.movementsEvent = movementsEvent
            this.init()
        })

        this.recurringMovementsEventSub = this.dataflowService.RecurringMovements.subscribe((movementsEvent) => {
            this.recurringMovementEvent = movementsEvent
            this.init()
        })
    }

    ngOnDestroy(): void {
        this.accountEventSub.unsubscribe()
        this.budgetSub.unsubscribe()
        this.movementsEventSub.unsubscribe()
        this.recurringMovementsEventSub.unsubscribe()
    }

    async Reload(): Promise<void> {
        await this.dataflowService.LoadMovementData()
    }

    private init(): void {
        this.Period = this.periodService.PeriodChange.value

        if (this.account == undefined) {
            return
        }

        if (this.movementsEvent.Type === 'error' || this.recurringMovementEvent.Type === 'error') {
            this.LoadingState = 'error'
            return
        } else if (this.movementsEvent.Type === 'loading' || this.recurringMovementEvent.Type === 'loading') {
            this.LoadingState = 'loading'
            return
        }

        this.LoadingState = 'loaded'

        let incomes = 0
        let expenses = 0
        let provision = 0

        let categoryTypeAmounts = new Array<number>(CategoryType.CategoryTypeCount)
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            categoryTypeAmounts[i] = 0
        }

        const categoryAmounts = new Map<string, categoryAmount>()

        const monthAmounts: number[] = new Array(Months.length).fill(0)

        const handleMovement = (categoryID: string, amount: number, month: number) => {
            if (amount < 0) {
                const categoryRef = this.categories.get(categoryID)
                if (categoryRef === undefined) {
                    return
                }

                if (this.Budget == undefined && !categoryRef.main) {
                    amount = Math.round(amount / 2)
                }

                const monthInYear = 12
                if (this.Period.Duration === PeriodDuration.Month) {
                    if (month === 0) {
                        amount = Math.round(amount / monthInYear)
                        provision -= amount
                    }
                } else {
                    if (month === 0) {
                        for (let i = 0; i < monthAmounts.length; i++) {
                            monthAmounts[i] += Math.round(amount / monthInYear)
                        }
                        provision -= amount
                    } else {
                        monthAmounts[month-1] += amount
                    }
                }

                expenses -= amount
                categoryTypeAmounts[categoryRef.category.Type] -= amount

                let categoryAmount = categoryAmounts.get(categoryRef.category.Name)
                if (categoryAmount == undefined) {
                    categoryAmount = {
                        Category: categoryRef.category,
                        Ratio: 0,
                        Amount: 0,
                    }
                    categoryAmounts.set(categoryRef.category.Name, categoryAmount)
                }
                categoryAmount.Amount -= amount
            } else {
                incomes += amount
                monthAmounts[month-1] += amount
            }
        }
        for (const movement of this.movementsEvent.Movements) {
            handleMovement(movement.CategoryID, movement.Amount, movement.Month)
        }


        const handleRecurringMovement = (movement: RecurringMovement) => {
            const categoryRef = this.categories.get(movement.CategoryID)
            if (categoryRef === undefined) {
                return
            }

            var amount = movement.Amount

            if (this.Budget == undefined && !categoryRef.main) {
                amount = Math.round(amount / 2)
            }

            const monthInYear = 12
            if (this.Period.Duration === PeriodDuration.Month) {
                if (movement.FirstMonth === 0) {
                    amount = Math.round(amount / monthInYear)
                    provision -= amount
                }
            } else {
                if (movement.FirstMonth === 0) {
                    for (let i = 0; i < monthAmounts.length; i++) {
                        monthAmounts[i] += Math.round(amount / monthInYear)
                    }
                    provision -= amount
                } else {
                    let monthCount = 0
                    for (let i = 0; i < monthAmounts.length; i++) {
                        if (isMonthInMovement(movement, this.Period.Year, i+1)) {
                            monthCount += 1
                            monthAmounts[i] += amount
                        }
                    }
                    amount *= monthCount
                }
            }

            expenses -= amount
            categoryTypeAmounts[categoryRef.category.Type] -= amount

            let categoryAmount = categoryAmounts.get(categoryRef.category.Name)
            if (categoryAmount == undefined) {
                categoryAmount = {
                    Category: categoryRef.category,
                    Ratio: 0,
                    Amount: 0,
                }
                categoryAmounts.set(categoryRef.category.Name, categoryAmount)
            }
            categoryAmount.Amount -= amount
        }
        for (const movement of this.recurringMovementEvent.Movements) {
            handleRecurringMovement(movement)
        }

        const centFactor = 100
        this.CategoryAmounts = Array.from(categoryAmounts.values())
        for (const categoryAmount of this.CategoryAmounts) {
            if (expenses === 0) {
                categoryAmount.Ratio = 0
            } else {
                categoryAmount.Ratio = Math.round((categoryAmount.Amount / expenses) * centFactor)
            }
            categoryAmount.Amount /= centFactor
        }
        this.CategoryAmounts.sort((a, b) => {
            return b.Amount - a.Amount
        })

        const labels: string[] = []
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            if (categoryTypeAmounts[i] !== 0) {
                const ratio = Math.round((categoryTypeAmounts[i] / expenses) * centFactor)
                labels.push(`${this.categoryTypeLabels[i]}: ${ratio}%`)
                categoryTypeAmounts[i] /= centFactor
            }
        }
        categoryTypeAmounts = categoryTypeAmounts.filter((amount) => {
            return amount !== 0
        })
        this.CategoryTypeAmountsChartData = {
            labels: labels,
            series: categoryTypeAmounts,
        }

        for (let i = 0; i < monthAmounts.length; i++) {
            monthAmounts[i] /= centFactor
        }
        this.MonthsBalanceChartData.series = [monthAmounts]

        this.Incomes = incomes / centFactor
        this.Expenses = - expenses / centFactor
        this.Balance = (incomes - expenses) / centFactor
        this.Provision = provision / centFactor
    }
}
