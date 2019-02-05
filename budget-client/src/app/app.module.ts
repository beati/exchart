import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'

import { AppRoutingModule } from './app-routing.module'

import { AppComponent } from './app.component'
import { LandingPageComponent } from './components/landing-page/landing-page.component'
import { LoginComponent } from './components/login/login.component'
import { MainComponent } from './components/main/main.component'
import { RegisterComponent } from './components/register/register.component'
import { ShellComponent } from './components/shell/shell.component'

@NgModule({
    declarations: [
        AppComponent,
        LandingPageComponent,
        LoginComponent,
        MainComponent,
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
        MatSidenavModule,
        MatToolbarModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
