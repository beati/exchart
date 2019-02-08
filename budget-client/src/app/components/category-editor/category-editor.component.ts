import { Component, OnInit } from '@angular/core'

import { BudgetService } from '../../services/budget.service'

@Component({
    selector: 'app-category-editor',
    templateUrl: './category-editor.component.html',
    styleUrls: ['./category-editor.component.scss'],
})
export class CategoryEditorComponent implements OnInit {
    constructor(
        private readonly budgetService: BudgetService,
    ) { }

    async ngOnInit(): Promise<void> {
    }
}
