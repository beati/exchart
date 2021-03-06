import { animate, state, style, transition, trigger } from '@angular/animations'
import { Component, OnDestroy, OnInit } from '@angular/core'

import { BehaviorSubject, Subscription } from 'rxjs'

import { MatDialog } from '@angular/material/dialog'

import { Budget, Category, CategoryTypes, Months, Movement, RecurringMovement } from '../../domain/domain'

import { DataflowService, EventType, MovementsEvent, RecurringMovementsEvent } from '../../services/dataflow.service'

import { DeleteMovementDialogComponent } from '../delete-movement-dialog/delete-movement-dialog.component'
import { DeleteRecurringMovementDialogComponent } from '../delete-recurring-movement-dialog/delete-recurring-movement-dialog.component'
import { EditRecurringMovementDialogComponent } from '../edit-recurring-movement-dialog/edit-recurring-movement-dialog.component'

@Component({
    selector: 'app-movement-list',
    templateUrl: './movement-list.component.html',
    styleUrls: ['./movement-list.component.scss'],
    animations: [
        trigger('rowExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ],
})
export class MovementListComponent implements OnInit, OnDestroy {
    Months = Months
    CategoryTypes = CategoryTypes

    LoadingState: EventType = 'loading'

    private budget: Budget | undefined
    private budgetSub: Subscription
    Categories: { [id: string]: Category } = {}

    MovementsColumns = ['Month', 'Year', 'Amount']
    Movements = new BehaviorSubject<Movement[]>([])
    MovementsEvent: MovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private movementsEventSub: Subscription
    ExpandedMovement: Movement | undefined

    RecurringMovementsColumns = ['Period', 'Start', 'End', 'Amount']
    RecurringMovements = new BehaviorSubject<RecurringMovement[]>([])
    RecurringMovementsEvent: RecurringMovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private recurringMovementsEventSub: Subscription
    ExpandedRecurringMovement: RecurringMovement | undefined

    constructor(
        private readonly dialog: MatDialog,
        private readonly dataflowService: DataflowService,
    ) {}

    ngOnInit(): void {
        this.budgetSub = this.dataflowService.SelectedBudget.subscribe((budget) => {
            this.budget = budget
            if (budget != undefined) {
                this.Categories = {}
                for (const category of budget.Categories) {
                    this.Categories[category.ID] = category
                }
            }
            this.init()
        })

        this.movementsEventSub = this.dataflowService.Movements.subscribe((movementsEvent) => {
            this.MovementsEvent = movementsEvent
            this.Movements.next(this.MovementsEvent.Movements)
            this.init()
        })

        this.recurringMovementsEventSub = this.dataflowService.RecurringMovements.subscribe((movementsEvent) => {
            this.RecurringMovementsEvent = movementsEvent
            this.RecurringMovements.next(this.RecurringMovementsEvent.Movements)
            this.init()
        })
    }

    ngOnDestroy(): void {
        this.budgetSub.unsubscribe()
        this.movementsEventSub.unsubscribe()
        this.recurringMovementsEventSub.unsubscribe()
    }

    async Reload(): Promise<void> {
        await this.dataflowService.LoadMovementData()
    }

    private init(): void {
        this.ExpandedMovement = undefined
        this.ExpandedRecurringMovement = undefined

        if (this.budget == undefined) {
            return
        }

        if (this.MovementsEvent.Type === 'error' || this.RecurringMovementsEvent.Type === 'error') {
            this.LoadingState = 'error'
            return
        } else if (this.MovementsEvent.Type === 'loading' || this.RecurringMovementsEvent.Type === 'loading') {
            this.LoadingState = 'loading'
            return
        }
        this.LoadingState = 'loaded'
    }

    DeleteMovement(movement: Movement): void {
        this.dialog.open(DeleteMovementDialogComponent, {
            autoFocus: false,
            data: movement,
        })
    }

    DeleteRecurringMovement(movement: RecurringMovement): void {
        this.dialog.open(DeleteRecurringMovementDialogComponent, {
            autoFocus: false,
            data: movement,
        })
    }

    UpdateRecurringMovement(movement: RecurringMovement): void {
        this.dialog.open(EditRecurringMovementDialogComponent, {
            autoFocus: false,
            data: movement,
        })
    }
}
