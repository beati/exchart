import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import {
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTabsModule,
    MatToolbarModule,
    MatTreeModule,
} from '@angular/material'

import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslationLoader } from './translations/translation'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { BudgetAcceptDialogComponent } from './components/budget-accept-dialog/budget-accept-dialog.component'
import { BudgetAdderDialogComponent } from './components/budget-adder-dialog/budget-adder-dialog.component'
import { BudgetAdderComponent } from './components/budget-adder/budget-adder.component'
import { BudgetAnalyticsComponent } from './components/budget-analytics/budget-analytics.component'
import { BudgetTabsComponent } from './components/budget-tabs/budget-tabs.component'
import { CategoryEditorContainerComponent } from './components/category-editor-container/category-editor-container.component'
import { CategoryEditorComponent } from './components/category-editor/category-editor.component'
import { DeleteCategoryDialogComponent } from './components/delete-category-dialog/delete-category-dialog.component'
import { IconButtonSpinnerComponent } from './components/icon-button-spinner/icon-button-spinner.component'
import { LandingPageComponent } from './components/landing-page/landing-page.component'
import { LoginComponent } from './components/login/login.component'
import { MainComponent } from './components/main/main.component'
import { MovementAdderDialogComponent } from './components/movement-adder-dialog/movement-adder-dialog.component'
import { MovementAdderComponent } from './components/movement-adder/movement-adder.component'
import { MovementListComponent } from './components/movement-list/movement-list.component'
import { OverallAnalyticsComponent } from './components/overall-analytics/overall-analytics.component'
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component'
import { RegisterComponent } from './components/register/register.component'
import { SettingsComponent } from './components/settings/settings.component'
import { ShellComponent } from './components/shell/shell.component'
import { YearSelectorComponent } from './components/year-selector/year-selector.component'

@NgModule({
    declarations: [
        AppComponent,
        BudgetAcceptDialogComponent,
        BudgetAdderDialogComponent,
        BudgetAdderComponent,
        BudgetAnalyticsComponent,
        BudgetTabsComponent,
        CategoryEditorContainerComponent,
        CategoryEditorComponent,
        DeleteCategoryDialogComponent,
        IconButtonSpinnerComponent,
        LandingPageComponent,
        LoginComponent,
        MainComponent,
        MovementAdderDialogComponent,
        MovementAdderComponent,
        MovementListComponent,
        OverallAnalyticsComponent,
        PeriodSelectorComponent,
        RegisterComponent,
        SettingsComponent,
        ShellComponent,
        YearSelectorComponent,
    ],
    entryComponents: [
        BudgetAcceptDialogComponent,
        BudgetAdderDialogComponent,
        DeleteCategoryDialogComponent,
        MovementAdderDialogComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        // Angular material
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        MatSidenavModule,
        MatSnackBarModule,
        MatTabsModule,
        MatToolbarModule,
        MatTreeModule,
        // Translation
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslationLoader,
            },
        }),
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
