import { Component, Input, OnInit } from '@angular/core'

import { Budget, Category, CategoryType } from '../../domain/domain'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-category-editor',
    templateUrl: './category-editor.component.html',
    styleUrls: ['./category-editor.component.scss'],
})
export class CategoryEditorComponent implements OnInit {
    @Input() Budget: Budget

    Categories: Category[][] = new Array<Category[]>(CategoryType.CategoryTypeCount)

    constructor(
        private readonly budgetService: BudgetService,
    ) {
        for (let i = 0; i < this.Categories.length; i++) {
            this.Categories[i] = []
        }
    }

    ngOnInit(): void {
        for (let i = 0; i < this.Budget.Categories.length; i++) {
            const category = this.Budget.Categories[i]
            this.Categories[category.Type].push(category)
        }
    }
}
