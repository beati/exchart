import { Component, OnInit } from '@angular/core'

import { Subscription } from 'rxjs'

import { Movement } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'

@Component({
    selector: 'app-movement-list',
    templateUrl: './movement-list.component.html',
    styleUrls: ['./movement-list.component.scss'],
})
export class MovementListComponent implements OnInit {
    Columns = ['Amount']

    Movements: Movement[]
    MovementsSub: Subscription

    constructor(
        private readonly dataflowService: DataflowService,
    ) {}

    ngOnInit(): void {
        this.Movements = this.dataflowService.Movements.value
        this.MovementsSub = this.dataflowService.Movements.subscribe((movements) => {
            this.Movements = movements
        })
    }
}
