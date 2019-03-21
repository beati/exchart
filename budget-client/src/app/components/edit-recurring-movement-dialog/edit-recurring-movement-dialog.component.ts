import { Component, Inject, OnInit } from '@angular/core'

import { DateTime } from 'luxon'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Months, RecurringMovement } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-edit-recurring-movement-dialog',
    templateUrl: './edit-recurring-movement-dialog.component.html',
    styleUrls: ['./edit-recurring-movement-dialog.component.scss'],
})
export class EditRecurringMovementDialogComponent implements OnInit {
    Months = Months

    Submitting = false
    End = {
        Year: 0,
        Month: 0,
    }

    constructor(
        private readonly dialogRef: MatDialogRef<EditRecurringMovementDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Movement: RecurringMovement,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    ngOnInit(): void {
        const now = DateTime.local()
        this.End.Year = now.year
        if (this.Movement.FirstMonth === 0) {
            this.End.Month = 0
        } else {
            this.End.Month = now.month
        }
    }

    Cancel(): void {
        this.dialogRef.close()
    }

    async UpdateMovement(): Promise<void> {
        try {
            this.Submitting = true
            await this.dataflowService.UpdateRecurringMovement(this.Movement.ID, this.End.Year, this.End.Month)
            this.Submitting = false
            this.dialogRef.close()
        } catch (error) {
            await this.errorService.DisplayError()
        }
    }
}
