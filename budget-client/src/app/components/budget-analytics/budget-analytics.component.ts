import { Component, OnDestroy, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { TranslateService } from '@ngx-translate/core'

import { Account, Budget, BudgetStatus, Category, CategoryType, CategoryTypes } from '../../domain/domain'

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

@Component({
    selector: 'app-budget-analytics',
    templateUrl: './budget-analytics.component.html',
    styleUrls: ['./budget-analytics.component.scss'],
})
export class BudgetAnalyticsComponent implements OnInit, OnDestroy {
    CategoryTypes = CategoryTypes

    private readonly categoryTypeLabels: string[] = []

    private account: Account | undefined
    private accountEventSub: Subscription
    private categories: Map<string, categoryRef>

    private budget: Budget | undefined
    private budgetSub: Subscription

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

    CategoryAmountColumns = ['Type', 'Category', 'Amount', 'Ratio']
    CategoryAmounts: categoryAmount[] = []

    CategoryTypeAmountsChartData: Chartist.IChartistData
    CategoryTypeAmountsChartOption: Chartist.IPieChartOptions = {
        donut: true,
    }

    constructor(
        private readonly translate: TranslateService,
        private readonly dataflowService: DataflowService,
    ) {}

    async ngOnInit(): Promise<void> {
        const categoryTypeTranslations = (await this.translate.get('CategoryTypes').toPromise()) as { [type: string]: string }
        for (const type of CategoryTypes) {
            this.categoryTypeLabels.push(categoryTypeTranslations[type])
        }

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
            this.budget = budget
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

        let total = 0

        let categoryTypeAmounts = new Array<number>(CategoryType.CategoryTypeCount)
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            categoryTypeAmounts[i] = 0
        }

        const categoryAmounts = new Map<string, categoryAmount>()

        const handleMovement = (categoryID: string, amount: number) => {
            if (amount < 0) {
                const categoryRef = this.categories.get(categoryID)
                if (categoryRef === undefined) {
                    return
                }

                total -= amount
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
                if (this.budget == undefined && !categoryRef.main) {
                    categoryAmount.Amount -= amount / 2
                } else {
                    categoryAmount.Amount -= amount
                }
            }
        }
        for (const movement of this.movementsEvent.Movements) {
            handleMovement(movement.CategoryID, movement.Amount)
        }
        for (const movement of this.recurringMovementEvent.Movements) {
            handleMovement(movement.CategoryID, movement.Amount)
        }

        const centFactor = 100
        this.CategoryAmounts = Array.from(categoryAmounts.values())
        for (const categoryAmount of this.CategoryAmounts) {
            if (total === 0) {
                categoryAmount.Ratio = 0
            } else {
                categoryAmount.Ratio = Math.round((categoryAmount.Amount / total) * centFactor)
            }
            categoryAmount.Amount /= centFactor
        }
        this.CategoryAmounts.sort((a, b) => {
            return b.Amount - a.Amount
        })

        const labels: string[] = []
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            if (categoryTypeAmounts[i] !== 0) {
                const ratio = Math.round((categoryTypeAmounts[i] / total) * centFactor)
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
    }
}
