import { AfterViewInit, Component, OnDestroy } from '@angular/core'

import * as Chartist from 'chartist'

import { DomIDService } from '../../services/dom-id.service'

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements AfterViewInit, OnDestroy {
    ID: string

    chart: Chartist.IChartistLineChart

    constructor(domIDService: DomIDService){
        this.ID = domIDService.Generate()
    }

    ngAfterViewInit(): void {
        this.chart = new Chartist.Line(`#${this.ID}`, {
            labels: [1, 2, 3, 4],
            series: [
                [23, 45, 64, 23],
            ],
        })
    }

    ngOnDestroy(): void {
        this.chart.detach()
    }
}
