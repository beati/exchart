import { Component, Input, OnInit } from '@angular/core'

import { Budget } from '../../domain/domain'

import { DisplayType, ResponsiveService } from '../../services/responsive.service'

@Component({
    selector: 'app-category-editor-container',
    templateUrl: './category-editor-container.component.html',
    styleUrls: ['./category-editor-container.component.scss'],
})
export class CategoryEditorContainerComponent implements OnInit {
    Mobile: boolean

    private budget: Budget
    @Input()
    set Budget(budget: Budget) {
        this.budget = budget
    }
    get Budget(): Budget {
        return this.budget
    }

    constructor(
        private readonly responsive: ResponsiveService,
    ) {}

    ngOnInit(): void {
        this.Mobile = this.responsive.Display() === DisplayType.Mobile

        this.responsive.DisplayChange.subscribe((display) => {
            this.Mobile = display === DisplayType.Mobile
        })
    }
}
