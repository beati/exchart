import { Input, Output, EventEmitter, Component } from '@angular/core'

@Component({
    selector: 'app-loading-indication',
    templateUrl: './loading-indication.component.html',
    styleUrls: ['./loading-indication.component.scss'],
})
export class LoadingIndicationComponent {
    @Input() Failed = false
    @Output() Reload = new EventEmitter<void>()
}