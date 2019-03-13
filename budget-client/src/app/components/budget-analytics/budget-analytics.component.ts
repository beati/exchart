import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-budget-analytics',
    templateUrl: './budget-analytics.component.html',
    styleUrls: ['./budget-analytics.component.scss'],
})
export class BudgetAnalyticsComponent implements OnInit {
    LineData = {
        labels: ['1', '2', '3', '{{ lol }}'],
        series: [[23, 45, 67, 43]],
    }
    PieData = {
        labels: ['1', '2', '3', '{{ lol }}'],
        series: [23, 45, 67, 43],
    }

    ngOnInit(): void {
    }
}
