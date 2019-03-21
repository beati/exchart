import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core'

import { Subscription } from 'rxjs'

import { MatDialog } from '@angular/material/dialog'
import { MatDrawerToggleResult, MatSidenav } from '@angular/material/sidenav'

import { Account, Budget, BudgetStatus } from '../../domain/domain'

import { AuthService } from '../../services/auth.service'
import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'
import { PeriodService } from '../../services/period.service'
import { DisplayType, ResponsiveService } from '../../services/responsive.service'

import { BudgetAcceptDialogComponent } from '../budget-accept-dialog/budget-accept-dialog.component'
import { BudgetAdderDialogComponent } from '../budget-adder-dialog/budget-adder-dialog.component'
import { BudgetAdderComponent } from '../budget-adder/budget-adder.component'
import { MovementAdderDialogComponent } from '../movement-adder-dialog/movement-adder-dialog.component'
import { MovementAdderComponent } from '../movement-adder/movement-adder.component'

@Component({
    selector: 'app-shell',
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit, OnDestroy {
    BudgetStatus = BudgetStatus

    private displayChangeSub: Subscription
    private accountSub: Subscription

    @ViewChild('sidenav') Sidenav: MatSidenav

    Mobile: boolean
    Loading = false
    LoadingFailed = false
    Page = 'Analytics'
    SubPage = ''

    @ViewChild('budgetAdder') BudgetAdder: BudgetAdderComponent
    @ViewChild('movementAdder') MovementAdder: MovementAdderComponent

    Account: Account

    constructor(
        private readonly dialog: MatDialog,
        private readonly responsive: ResponsiveService,
        private readonly periodService: PeriodService,
        private readonly authService: AuthService,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    async ngOnInit(): Promise<void> {
        this.Mobile = this.responsive.Display() === DisplayType.Mobile

        this.displayChangeSub = this.responsive.DisplayChange.subscribe((display) => {
            this.Mobile = display === DisplayType.Mobile

            if (!this.Mobile) {
                this.SubPage = ''
            }
        })

        this.periodService.Init()

        try {
            await this.dataflowService.Init()
        } catch (error) {
            this.LoadingFailed = true
        }

        this.accountSub = this.dataflowService.Account.subscribe((account) => {
            this.Account = account
        })
    }

    ngOnDestroy(): void {
        this.displayChangeSub.unsubscribe()
        this.accountSub.unsubscribe()
    }

    async Logout(): Promise<void> {
        try {
            await this.authService.Unauthenticate()
        } catch (error) {
            await this.errorService.DisplayError()
        }
    }

    async Refresh(): Promise<void> {
        this.Loading = true
        this.Loading = false
    }

    async SetPage(page: string): Promise<void> {
        this.Page = page

        if (this.Mobile) {
            await this.Sidenav.close()
        }
    }

    async SetPageAnalytics(): Promise<void> {
        await Promise.all([
            this.dataflowService.SelectBudget(''),
            this.SetPage('Analytics'),
        ])
    }

    async SetSubPage(subPage: string): Promise<void> {
        this.SubPage = subPage

        if (this.Mobile) {
            await this.Sidenav.close()
        }
    }

    async BudgetMenuAction(budget: Budget): Promise<void> {
        switch (budget.Status) {
        case BudgetStatus.Main:
        case BudgetStatus.Open:
            await Promise.all([
                this.dataflowService.SelectBudget(budget.ID),
                this.SetPage(budget.ID),
            ])
            break
        case BudgetStatus.NotAccepted:
            break
        case BudgetStatus.ToAccept:
            let sidenavClosed: Promise<MatDrawerToggleResult> | undefined
            if (this.Mobile) {
                sidenavClosed = this.Sidenav.close()
            }

            const dialogRef = this.dialog.open(BudgetAcceptDialogComponent, {
                autoFocus: false,
                data: budget.With,
            })
            const accepted = await dialogRef.afterClosed().toPromise()
            if (typeof accepted === 'boolean') {
                try {
                    this.Loading = true
                    if (accepted) {
                        await this.dataflowService.AcceptJointBudget(budget.ID)
                    } else {
                        await this.dataflowService.DisableJointBudget(budget.ID)
                    }
                    this.Loading = false
                } catch (error) {
                    this.Loading = false
                    await this.errorService.DisplayError()
                }
            }

            if (sidenavClosed != undefined) {
                await sidenavClosed
            }
            break
        }
    }

    async AddBudget(): Promise<void> {
        if (this.Mobile) {
            await this.SetSubPage('BudgetAdder')
        } else {
            this.dialog.open(BudgetAdderDialogComponent, {
                autoFocus: false,
            })
        }
    }

    async SubmitAddBudget(): Promise<void> {
        this.Loading = true
        const success = await this.BudgetAdder.AddBudget()
        this.Loading = false
        if (success) {
            this.SubPage = ''
        }
    }

    async AddMovement(): Promise<void> {
        if (this.Mobile) {
            await this.SetSubPage('MovementAdder')
        } else {
            this.dialog.open(MovementAdderDialogComponent, {
                autoFocus: false,
            })
        }
    }

    async SubmitAddMovement(): Promise<void> {
        this.Loading = true
        const success = await this.MovementAdder.AddMovement()
        this.Loading = false
        if (success) {
            this.SubPage = ''
        }
    }
}
