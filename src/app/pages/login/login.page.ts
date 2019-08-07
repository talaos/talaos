import { Component, OnInit } from '@angular/core';
import { GlpiService } from '../../services/glpi.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public loginForm;
  public redirectURL = '/';
  public doConnection = false;
  public errorMsg = '';
  public validationMessages = {
    glpiurl: [
      { type: 'required', message: 'The GLPI URL is required.' },
      { type: 'pattern', message: 'The URL is not valid.' },
      { type: 'httperror', message: 'There are some problems with this URL' },
    ],
    apptoken: [
      { type: 'invalidAPI', message: 'The APP Token is invalid.' },
    ],
    login: [],
    password: [
      { type: 'invalidPassword', message: 'The password is invalid.' },
    ],
  };
  public displayLoading = true;

  constructor(private glpi: GlpiService, public formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router) {

    const regUrl = '(https?://)?(([\\da-z.-]+)\\.([a-z.]{2,6})|([.[0-9])+)[/\\w .-]*/?';
    this.loginForm = formBuilder.group({
        glpiurl: ['', [Validators.required, Validators.pattern(regUrl)]],
        apptoken: [''],
        login: [''],
        password: [''],
    });

    this.route.queryParams.subscribe(params => {
      if ('redirect' in params) {
        this.redirectURL = params.redirect;
      }
    });
    this.glpi.authState.subscribe(state => {
      if (state == null) {

      } else if (state) {
        this.router.navigate([this.redirectURL]);
      } else if (!state) {
        this.displayLoading = false;
      }
    });
  }

  ngOnInit() {


  }

  public login() {
    this.doConnection = true;
    this.glpi.defineURL(this.loginForm.get('glpiurl').value);
    this.glpi.defineAppToken(this.loginForm.get('apptoken').value);
    this.glpi.doLogin(this.loginForm.get('login').value, this.loginForm.get('password').value)
      .subscribe(
        res => {
          this.router.navigate([this.redirectURL]);
        },
        error => {
          switch (error.error[0]) {
            case 'ERROR_WRONG_APP_TOKEN_PARAMETER':
              this.loginForm.controls['apptoken'].setErrors({
                incorrect: true,
                invalidAPI: true
              });
              this.loginForm.controls['apptoken'].markAsTouched();
              break;

            case 'ERROR_GLPI_LOGIN':
              this.loginForm.controls['password'].setErrors({
                incorrect: true,
                invalidPassword: true
              });
              this.loginForm.controls['password'].markAsTouched();
              break;

            default:
              this.loginForm.controls['glpiurl'].setErrors({
                incorrect: true,
                httperror: true
              });
              this.loginForm.controls['glpiurl'].markAsTouched();
              break;

          }
          this.doConnection = false;
        });
  }

}
