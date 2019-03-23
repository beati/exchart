import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
    selector: 'app-loading-indication',
    templateUrl: './loading-indication.component.html',
    styleUrls: ['./loading-indication.component.scss'],
})
export class LoadingIndicationComponent {
    @Input() Failed = false
    @Output() Retry = new EventEmitter<void>()
}
