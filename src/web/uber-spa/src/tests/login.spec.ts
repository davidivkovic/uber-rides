import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import auth from '@app/api/auth'
import Login from '@app/pages/auth/login'

describe('Login', () => {
  let component: Login
  let fixture: ComponentFixture<Login>
  let router: Router
  let form: HTMLFormElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [RouterTestingModule]}).compileComponents()
    fixture = TestBed.createComponent(Login)
    component = fixture.componentInstance
    fixture.detectChanges()
    router = TestBed.get(Router)
    form = fixture.debugElement.query(By.css('form')).nativeElement
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should call the onSubmit method', async () => {
    spyOn(component, 'login')
    const button = fixture.debugElement.query(By.css('button[type=submit]')).nativeElement
    button.click()
    expect(component.login).toHaveBeenCalledTimes(0)
  })

  it('should not submit the form', async () => {
    spyOn(component, 'login')

    component.email = ''
    component.password = ''

    form.requestSubmit()

    await fixture.whenStable()

    expect(component.login).not.toHaveBeenCalled()
  })

  it('should set error message', async () => {
    spyOn(auth, 'login').and.throwError('Bad credentials')
    spyOn(router, 'navigate').and.stub()

    component.email = 'email@example.com'
    component.password = 'notmypassword'

    form.dispatchEvent(new Event('submit'))

    await fixture.whenStable()

    expect(component.error).toEqual('Bad credentials')
    expect(router.navigate).not.toHaveBeenCalled()
  })

  it('should navigate to homepage', async () => {
    spyOn(auth, 'login').and.returnValue(Promise.resolve())
    spyOn(router, 'navigate').and.stub()

    component.email = 'email@example.com'
    component.password = 'verysecurepassword'

    form.dispatchEvent(new Event('submit'))

    await fixture.whenStable()

    expect(component.error).toEqual('')
    expect(router.navigate).toHaveBeenCalledWith(['/'])
  })
})