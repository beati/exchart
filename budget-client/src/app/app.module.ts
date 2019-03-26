import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatCardModule } from '@angular/material/card'
import { MatDialogModule } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTableModule } from '@angular/material/table'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'

import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslationLoader } from './translations/translation'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { BudgetAcceptDialogComponent } from './components/budget-accept-dialog/budget-accept-dialog.component'
import { BudgetAdderDialogComponent } from './components/budget-adder-dialog/budget-adder-dialog.component'
import { BudgetAdderComponent } from './components/budget-adder/budget-adder.component'
import { BudgetAnalyticsComponent } from './components/budget-analytics/budget-analytics.component'
import { BudgetTabsComponent } from './components/budget-tabs/budget-tabs.component'
import { ButtonSpinnerComponent } from './components/button-spinner/button-spinner.component'
import { CategoryEditorContainerComponent } from './components/category-editor-container/category-editor-container.component'
import { CategoryEditorComponent } from './components/category-editor/category-editor.component'
import { ChartLineComponent } from './components/chart-line/chart-line.component'
import { ChartPieComponent } from './components/chart-pie/chart-pie.component'
import { DeleteBudgetDialogComponent } from './components/delete-budget-dialog/delete-budget-dialog.component'
import { DeleteCategoryDialogComponent } from './components/delete-category-dialog/delete-category-dialog.component'
import { DeleteMovementDialogComponent } from './components/delete-movement-dialog/delete-movement-dialog.component'
import { DeleteRecurringMovementDialogComponent } from './components/delete-recurring-movement-dialog/delete-recurring-movement-dialog.component'
import { EditRecurringMovementDialogComponent } from './components/edit-recurring-movement-dialog/edit-recurring-movement-dialog.component'
import { EmailChangerComponent } from './components/email-changer/email-changer.component'
import { EmailVerifierComponent } from './components/email-verifier/email-verifier.component'
import { IconButtonSpinnerComponent } from './components/icon-button-spinner/icon-button-spinner.component'
import { JointBudgetListComponent } from './components/joint-budget-list/joint-budget-list.component'
import { LandingPageComponent } from './components/landing-page/landing-page.component'
import { LoadingIndicationComponent } from './components/loading-indication/loading-indication.component'
import { LoginComponent } from './components/login/login.component'
import { MainComponent } from './components/main/main.component'
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component'
import { MovementAdderDialogComponent } from './components/movement-adder-dialog/movement-adder-dialog.component'
import { MovementAdderComponent } from './components/movement-adder/movement-adder.component'
import { MovementListComponent } from './components/movement-list/movement-list.component'
import { NameChangerComponent } from './components/name-changer/name-changer.component'
import { PasswordChangerComponent } from './components/password-changer/password-changer.component'
import { PasswordResetRequesterComponent } from './components/password-reset-requester/password-reset-requester.component'
import { PasswordResetterComponent } from './components/password-resetter/password-resetter.component'
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component'
import { PreShellContainerComponent } from './components/pre-shell-container/pre-shell-container.component'
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
        ButtonSpinnerComponent,
        CategoryEditorContainerComponent,
        CategoryEditorComponent,
        ChartLineComponent,
        ChartPieComponent,
        DeleteBudgetDialogComponent,
        DeleteCategoryDialogComponent,
        DeleteMovementDialogComponent,
        DeleteRecurringMovementDialogComponent,
        EditRecurringMovementDialogComponent,
        EmailChangerComponent,
        EmailVerifierComponent,
        IconButtonSpinnerComponent,
        JointBudgetListComponent,
        LandingPageComponent,
        LoadingIndicationComponent,
        LoginComponent,
        MainComponent,
        MessageDialogComponent,
        MovementAdderDialogComponent,
        MovementAdderComponent,
        MovementListComponent,
        NameChangerComponent,
        PasswordChangerComponent,
        PasswordResetRequesterComponent,
        PasswordResetterComponent,
        PeriodSelectorComponent,
        PreShellContainerComponent,
        RegisterComponent,
        SettingsComponent,
        ShellComponent,
        YearSelectorComponent,
    ],
    entryComponents: [
        BudgetAcceptDialogComponent,
        BudgetAdderDialogComponent,
        DeleteBudgetDialogComponent,
        DeleteCategoryDialogComponent,
        DeleteMovementDialogComponent,
        DeleteRecurringMovementDialogComponent,
        EditRecurringMovementDialogComponent,
        MessageDialogComponent,
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
        MatTableModule,
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
