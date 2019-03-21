import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { RecurringMovement } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-delete-recurring-movement-dialog',
    templateUrl: './delete-recurring-movement-dialog.component.html',
    styleUrls: ['./delete-recurring-movement-dialog.component.scss'],
})
export class DeleteRecurringMovementDialogComponent {
    Submitting = false

    constructor(
        private readonly dialogRef: MatDialogRef<DeleteRecurringMovementDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Movement: RecurringMovement,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    Cancel(): void {
        this.dialogRef.close()
    }

    async DeleteMovement(): Promise<void> {
        try {
            this.Submitting = true
            await this.dataflowService.DeleteRecurringMovement(this.Movement.ID)
            this.Submitting = false
            this.dialogRef.close()
        } catch (error) {
            await this.errorService.DisplayError()
        }
    }
}
