import { Component, OnInit, OnDestroy } from '@angular/core'

import { Subscription } from 'rxjs'

import { TranslateService } from '@ngx-translate/core'

import { Budget, Category, CategoryType, CategoryTypes, Movement, RecurringMovement } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'

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

    private categoryTypeLabels: string[] = []

    private budget: Budget | undefined
    private budgetSub: Subscription

    private movements: Movement[] = []
    private movementsSub: Subscription
    private recurringMovement: RecurringMovement[] = []
    private recurringMovementsSub: Subscription

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
        const categoryTypeTranslations = await this.translate.get('CategoryTypes').toPromise()
        for (let type of CategoryTypes) {
            this.categoryTypeLabels.push(categoryTypeTranslations[type])
        }

        this.budgetSub = this.dataflowService.SelectedBudget.subscribe((budget) => {
            this.budget = budget
            this.Init()
        })

        this.movementsSub = this.dataflowService.Movements.subscribe((movements) => {
            this.movements = movements
            this.Init()
        })

        this.recurringMovementsSub = this.dataflowService.RecurringMovements.subscribe((movements) => {
            this.recurringMovement = movements
            this.Init()
        })
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe()
        this.movementsSub.unsubscribe()
        this.recurringMovementsSub.unsubscribe()
    }

    Init(): void {
        if (this.budget == undefined) {
            return
        }

        const categoryAmounts = new Map<string, categoryAmount>()
        for (let category of this.budget.Categories) {
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

        for (let movement of this.movements) {
            if (movement.Amount < 0) {
                const categoryAmount = categoryAmounts.get(movement.CategoryID)
                if (categoryAmount != undefined) {
                    total -= movement.Amount
                    categoryAmount.Amount -= movement.Amount
                    categoryTypeAmounts[categoryAmount.Category.Type] -= movement.Amount
                }
            }
        }
        for (let movement of this.recurringMovement) {
            if (movement.Amount < 0) {
                const categoryAmount = categoryAmounts.get(movement.CategoryID)
                if (categoryAmount != undefined) {
                    total -= movement.Amount
                    categoryAmount.Amount -= movement.Amount
                    categoryTypeAmounts[categoryAmount.Category.Type] -= movement.Amount
                }
            }
        }

        this.CategoryAmounts = Array.from(categoryAmounts.values())
        for (let categoryAmount of this.CategoryAmounts) {
            categoryAmount.Ratio = Math.round((categoryAmount.Amount / total) * 100)
            categoryAmount.Amount /= 100
        }
        this.CategoryAmounts.sort((a, b) => {
            return b.Amount - a.Amount
        })

        const labels: string[] = []
        for (let i = 0; i < categoryTypeAmounts.length; i += 1) {
            if (categoryTypeAmounts[i] !== 0) {
                const ratio = Math.round((categoryTypeAmounts[i] / total) * 100)
                labels.push(`${this.categoryTypeLabels[i]}: ${ratio}%`)
                categoryTypeAmounts[i] /= 100
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
