import { Component, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { DataflowService } from '../../services/dataflow.service'

@Component({
    selector: 'app-budget-analytics',
    templateUrl: './budget-analytics.component.html',
    styleUrls: ['./budget-analytics.component.scss'],
})
export class BudgetAnalyticsComponent implements OnInit {
    private movementSub: Subscription
    private recurringMovementSub: Subscription

    constructor(
        readonly dataflowService: DataflowService,
    ) {}

    ngOnInit(): void {
        this.movementSub = this.dataflowService.Movements.subscribe((movements) => {
        })

        this.recurringMovementSub = this.dataflowService.RecurringMovements.subscribe((movements) => {
        })
    }
}
