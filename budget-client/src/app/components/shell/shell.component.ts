import { Component, OnInit, ViewChild } from '@angular/core'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

import { MatDialog, MatSidenav } from '@angular/material'

import { Account, Budget, BudgetStatus, Month, Movement, RecurringMovement } from '../../domain/domain'

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
    OpenBudgets: Budget[]

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

            this.Account.Budgets.sort((a: Budget, b: Budget): number => {
                if (a.Status === BudgetStatus.Main) {
                    return -1
                } else if (b.Status == BudgetStatus.Main) {
                    return 1
                }

                if (a.Status === BudgetStatus.Open) {
                    return -1
                } else if (b.Status == BudgetStatus.Open) {
                    return 1
                }

                if (a.Status === BudgetStatus.NotAccepted) {
                    return -1
                } else if (b.Status == BudgetStatus.NotAccepted) {
                    return 1
                }

                return 0
            })

            const budgets: Budget[] = []
            for (let i = 0; i < this.Account.Budgets.length; i++) {
                const budget = this.Account.Budgets[i]
                if (budget.Status === BudgetStatus.Main || budget.Status === BudgetStatus.Open) {
                    budgets.push(budget)
                }
            }
            this.OpenBudgets = budgets
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
