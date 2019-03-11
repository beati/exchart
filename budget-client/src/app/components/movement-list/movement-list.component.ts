import { Component } from '@angular/core'

import { DataflowService } from '../../services/dataflow.service'

@Component({
    selector: 'app-movement-list',
    templateUrl: './movement-list.component.html',
    styleUrls: ['./movement-list.component.scss'],
})
export class MovementListComponent {
    Columns = ['Month', 'Year', 'Amount']

    constructor(
        readonly dataflowService: DataflowService,
    ) {}
}
