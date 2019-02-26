import { Component, OnInit, ViewChild } from '@angular/core'

import { MatDialog, MatSidenav } from '@angular/material'

import { Account, Budget, BudgetStatus } from '../../domain/domain'

import { AuthService } from '../../services/auth.service'
import { BudgetService } from '../../services/budget.service'
import { ErrorService } from '../../services/error.service'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

import { BudgetAcceptDialogComponent } from '../budget-accept-dialog/budget-accept-dialog.component'
import { BudgetAdderDialogComponent } from '../budget-adder-dialog/budget-adder-dialog.component'
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

    Loading = false

    Account: Account
    OpenBudgets: Budget[]

    State = 'All'
    SelectedBudget: Budget

    constructor(
        private readonly dialog: MatDialog,
        private readonly responsive: ResponsiveService,
        private readonly authService: AuthService,
        private readonly budgetService: BudgetService,
        private readonly errorService: ErrorService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.Mobile = this.responsive.Display() === DisplayType.Mobile

        this.responsive.DisplayChange.subscribe((display) => {
            this.Mobile = display === DisplayType.Mobile
        })

        this.budgetService.BudgetAdded.subscribe((budget) => {
            this.Account.Budgets.push(budget)
            this.Account.Budgets.sort(orderBudget)
        })

        try {
            this.Account = await this.budgetService.GetAcount()

            this.Account.Budgets.sort(orderBudget)

            const budgets: Budget[] = []
            for (const budget of this.Account.Budgets) {
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

    async Refresh(): Promise<void> {
        this.Loading = true
        this.Loading = false
    }

    async SetState(state: string): Promise<void> {
        this.State = state

        if (this.Mobile) {
            await this.sidenav.close()
        }
    }

    async BudgetMenuAction(budget: Budget): Promise<void> {
        switch (budget.Status) {
        case BudgetStatus.Main:
        case BudgetStatus.Open:
            this.SelectedBudget = budget
            await this.SetState(budget.ID)
            break
        case BudgetStatus.NotAccepted:
            break
        case BudgetStatus.ToAccept:
            const dialogRef = this.dialog.open(BudgetAcceptDialogComponent, {
                data: budget.With,
            })
            const accepted = await dialogRef.afterClosed().toPromise()
            if (typeof accepted === 'boolean' && accepted) {
                try {
                    this.Loading = true
                    await this.budgetService.AcceptJointBudget(budget.ID)
                    budget.Status = BudgetStatus.Open
                    this.Account.Budgets.sort(orderBudget)
                    this.Loading = false
                } catch (error) {
                    this.Loading = false
                    this.errorService.DisplayError()
                }
            }
            break
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

function orderBudget(a: Budget, b: Budget): number {
    if (a.Status === BudgetStatus.Main) {
        return -1
    } else if (b.Status === BudgetStatus.Main) {
        return 1
    }

    if (a.Status === BudgetStatus.Open) {
        return -1
    } else if (b.Status === BudgetStatus.Open) {
        return 1
    }

    if (a.Status === BudgetStatus.NotAccepted) {
        return -1
    } else if (b.Status === BudgetStatus.NotAccepted) {
        return 1
    }

    return 0
}
