import { Component, OnDestroy, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { MatDialog } from '@angular/material/dialog'

import { Budget, BudgetStatus } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

import { DeleteBudgetDialogComponent } from '../delete-budget-dialog/delete-budget-dialog.component'

interface BudgetEntry {
    Budget: Budget
    Submitting: boolean
}

@Component({
    selector: 'app-joint-budget-list',
    templateUrl: './joint-budget-list.component.html',
    styleUrls: ['./joint-budget-list.component.scss'],
})
export class JointBudgetListComponent implements OnInit, OnDestroy {
    private accountSub: Subscription

    Budgets: BudgetEntry[] = []

    constructor(
        private readonly dialog: MatDialog,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        this.accountSub = this.dataflowService.Account.subscribe((accountEvent) => {
            if (accountEvent.Type !== 'loaded' || accountEvent.Account == undefined) {
                return
            }

            this.Budgets = []
            for (const budget of accountEvent.Account.Budgets) {
                if (budget.Status === BudgetStatus.Open || budget.Status === BudgetStatus.NotAccepted) {
                    this.Budgets.push({
                        Budget: budget,
                        Submitting: false,
                    })
                }
            }
        })
    }

    ngOnDestroy(): void {
        this.accountSub.unsubscribe()
    }

    async DeleteBudget(entry: BudgetEntry): Promise<void> {
        const dialogRef = this.dialog.open(DeleteBudgetDialogComponent, {
            autoFocus: false,
            data: entry.Budget,
        })
        const deleteAccepted = await dialogRef.afterClosed().toPromise()

        if (typeof deleteAccepted === 'boolean' && deleteAccepted) {
            try {
                entry.Submitting = true
                await this.dataflowService.DisableJointBudget(entry.Budget.ID)
            } catch (error) {
                entry.Submitting = false
                this.errorService.DisplayError()
            }
        }
    }
}
