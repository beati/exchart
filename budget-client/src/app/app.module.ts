import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTreeModule } from '@angular/material/tree'

import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslationLoader } from './translations/translation'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { CategoryEditorComponent } from './components/category-editor/category-editor.component'
import { LandingPageComponent } from './components/landing-page/landing-page.component'
import { LoginComponent } from './components/login/login.component'
import { MainComponent } from './components/main/main.component'
import { PeriodSelectorComponent } from './components/period-selector/period-selector.component'
import { RegisterComponent } from './components/register/register.component'
import { ShellComponent } from './components/shell/shell.component'

@NgModule({
    declarations: [
        AppComponent,
        CategoryEditorComponent,
        LandingPageComponent,
        LoginComponent,
        MainComponent,
        PeriodSelectorComponent,
        RegisterComponent,
        ShellComponent,
    ],
    imports: [
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        // Angular material
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatSidenavModule,
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
