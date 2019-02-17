import { Component, OnInit, ViewChild } from '@angular/core'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

import { MatDialog, MatSidenav } from '@angular/material'

import { Account, BudgetStatus, Month, Movement, RecurringMovement } from '../../domain/domain'

import { AuthService } from '../../services/auth.service'
import { BudgetService } from '../../services/budget.service'

import { BudgetAdderDialogComponent } from '..//budget-adder-dialog/budget-adder-dialog.component'
import { MovementAdderDialogComponent } from '../movement-adder-dialog/movement-adder-dialog.component'

@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
    BudgetStatus = BudgetStatus

    @ViewChild('sidenav') sidenav: MatSidenav

    Mobile: boolean

    Account: Account

    State = 'All'

    constructor(
        private readonly dialog: MatDialog,
        private readonly responsive: ResponsiveService,
        private readonly authService: AuthService,
        private readonly budgetService: BudgetService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.Mobile = this.responsive.Display() === DisplayType.Mobile

        this.responsive.DisplayChange.subscribe((display) => {
            this.Mobile = display === DisplayType.Mobile
        })

        this.budgetService.BudgetAdded.subscribe((budget) => {
            this.Account.Budgets.push(budget)
            this.SetState(budget.ID)
        })

        try {
            this.Account = await this.budgetService.GetAcount()
        } catch (error) {
        }
    }

    async Logout(): Promise<void> {
        try {
            await this.authService.Unauthenticate()
        } catch (error) {
        }
    }

    async SetState(state: string): Promise<void> {
        this.State = state
        if (this.Mobile) {
            await this.sidenav.close()
        }
    }

    async AddBudget(): Promise<void> {
        if (this.Mobile) {
            await this.SetState('BudgetAdder')
        } else {
            this.dialog.open(BudgetAdderDialogComponent)
        }
    }

    OpenMovementAdderDialog(): void {
        this.dialog.open(MovementAdderDialogComponent)
    }
}
