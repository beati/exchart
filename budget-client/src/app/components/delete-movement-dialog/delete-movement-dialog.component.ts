import { Component, Inject } from '@angular/core'

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { Movement } from '../../domain/domain'

import { DataflowService } from '../../services/dataflow.service'
import { ErrorService } from '../../services/error.service'

@Component({
    selector: 'app-delete-movement-dialog',
    templateUrl: './delete-movement-dialog.component.html',
    styleUrls: ['./delete-movement-dialog.component.scss'],
})
export class DeleteMovementDialogComponent {
    Submitting = false

    constructor(
        private readonly dialogRef: MatDialogRef<DeleteMovementDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public Movement: Movement,
        private readonly dataflowService: DataflowService,
        private readonly errorService: ErrorService,
    ) {}

    Cancel(): void {
        this.dialogRef.close()
    }

    async DeleteMovement(): Promise<void> {
        try {
            this.Submitting = true
            await this.dataflowService.DeleteMovement(this.Movement.ID)
            this.Submitting = false
            this.dialogRef.close()
        } catch (error) {
            await this.errorService.DisplayError()
        }
    }
}
