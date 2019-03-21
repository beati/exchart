import { Component, OnDestroy, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { TranslateService } from '@ngx-translate/core'

import { Budget, Category, CategoryType, CategoryTypes } from '../../domain/domain'

import { DataflowService, MovementEventType, MovementsEvent, RecurringMovementsEvent } from '../../services/dataflow.service'

interface categoryAmount {
    Category: Category
    Amount: number
    Ratio: number
}

@Component({
    selector: 'app-budget-analytics',
    templateUrl: './budget-analytics.component.html',
    styleUrls: ['./budget-analytics.component.scss'],
})
export class BudgetAnalyticsComponent implements OnInit, OnDestroy {
    CategoryTypes = CategoryTypes

    private readonly categoryTypeLabels: string[] = []

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

    LoadingState: MovementEventType = 'loading'

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
        this.budgetSub.unsubscribe()
        this.movementsEventSub.unsubscribe()
        this.recurringMovementsEventSub.unsubscribe()
    }

    private init(): void {
        if (this.budget == undefined) {
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

        const categoryAmounts = new Map<string, categoryAmount>()
        for (const category of this.budget.Categories) {
            categoryAmounts.set(category.ID, {
                Category: category,
                Ratio: 0,
                Amount: 0,
            })
        }

        let categoryTypeAmounts = new Array<number>(CategoryType.CategoryTypeCount)
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            categoryTypeAmounts[i] = 0
        }

        let total = 0

        for (const movement of this.movementsEvent.Movements) {
            if (movement.Amount < 0) {
                const categoryAmount = categoryAmounts.get(movement.CategoryID)
                if (categoryAmount != undefined) {
                    total -= movement.Amount
                    categoryAmount.Amount -= movement.Amount
                    categoryTypeAmounts[categoryAmount.Category.Type] -= movement.Amount
                }
            }
        }
        for (const movement of this.recurringMovementEvent.Movements) {
            if (movement.Amount < 0) {
                const categoryAmount = categoryAmounts.get(movement.CategoryID)
                if (categoryAmount != undefined) {
                    total -= movement.Amount
                    categoryAmount.Amount -= movement.Amount
                    categoryTypeAmounts[categoryAmount.Category.Type] -= movement.Amount
                }
            }
        }

        const centFactor = 100
        this.CategoryAmounts = Array.from(categoryAmounts.values())
        for (const categoryAmount of this.CategoryAmounts) {
            categoryAmount.Ratio = Math.round((categoryAmount.Amount / total) * centFactor)
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
