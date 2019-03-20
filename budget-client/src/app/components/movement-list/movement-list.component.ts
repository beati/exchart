import { OnInit, OnDestroy, Component } from '@angular/core'
import { animate, state, style, transition, trigger } from '@angular/animations'

import { Subscription, BehaviorSubject } from 'rxjs'

import { Movement, RecurringMovement, Months } from '../../domain/domain'

import { MovementEventType, DataflowService, MovementsEvent, RecurringMovementsEvent } from '../../services/dataflow.service'

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

    LoadingState: MovementEventType = 'loading'

    MovementsColumns = ['Month', 'Year', 'Amount']
    Movements = new BehaviorSubject<Movement[]>([])
    private movementsEvent: MovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private movementsEventSub: Subscription
    ExpandedMovement: Movement | undefined

    RecurringMovementsColumns = ['Period', 'Start', 'End', 'Amount']
    RecurringMovements = new BehaviorSubject<RecurringMovement[]>([])
    private recurringMovementEvent: RecurringMovementsEvent = {
        Type: 'loading',
        Movements: [],
    }
    private recurringMovementsEventSub: Subscription
    ExpandedRecurringMovement: RecurringMovement | undefined

    constructor(
        readonly dataflowService: DataflowService,
    ) {}

    ngOnInit(): void {
        this.movementsEventSub = this.dataflowService.Movements.subscribe((movementsEvent) => {
            this.movementsEvent = movementsEvent
            this.Movements.next(this.movementsEvent.Movements)
            this.init()
        })

        this.recurringMovementsEventSub = this.dataflowService.RecurringMovements.subscribe((movementsEvent) => {
            this.recurringMovementEvent = movementsEvent
            this.RecurringMovements.next(this.recurringMovementEvent.Movements)
            this.init()
        })
    }

    ngOnDestroy(): void {
        this.movementsEventSub.unsubscribe()
        this.recurringMovementsEventSub.unsubscribe()
    }

    private init(): void {
        if (this.movementsEvent.Type === 'error' || this.recurringMovementEvent.Type === 'error') {
            this.LoadingState = 'error'
            return
        } else if (this.movementsEvent.Type === 'loading' || this.recurringMovementEvent.Type === 'loading') {
            this.LoadingState = 'loading'
            return
        }
        this.LoadingState = 'loaded'
    }
}
