import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import Signup from '@app/pages/auth/signup/signup'
import auth from '@app/api/auth'

describe('Signup', () => {
  let component: Signup
  let fixture: ComponentFixture<Signup>
  let router: Router
  let form: HTMLFormElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [RouterTestingModule]}).compileComponents()
    fixture = TestBed.createComponent(Signup)
    component = fixture.componentInstance
    fixture.detectChanges()
    router = TestBed.get(Router)
    form = fixture.debugElement.query(By.css('form')).nativeElement
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should call the onSubmit method', async () => {
    spyOn(component, 'signUp')
    const button = fixture.debugElement.query(By.css('button[type=submit]')).nativeElement
    button.click()
    expect(component.signUp).toHaveBeenCalledTimes(0)
  })

  it('should not submit the form', async () => {
    spyOn(component, 'signUp')
    form.requestSubmit()
    await fixture.whenStable()

    expect(component.signUp).not.toHaveBeenCalled()
  })

  it('should set error message', async () => {
    spyOn(auth, 'signUp').and.throwError('Email taken')
    spyOn(router, 'navigate')

    component.firstName = 'John'
    component.lastName = 'Doe'
    component.email = "john@example.com"
    component.password = 'password'
    component.city = 'New York'
    component.phoneNumber = '1234567890'

    form.dispatchEvent(new Event('submit'))

    await fixture.whenStable()

    expect(component.error).toEqual('Email taken')
    expect(router.navigate).not.toHaveBeenCalled()
  })

  it('should navigate to confirm email page', async () => {
    spyOn(auth, 'signUp').and.returnValue(Promise.resolve())
    spyOn(router, 'navigate')

    component.firstName = 'John'
    component.lastName = 'Doe'
    component.email = "john@example.com"
    component.password = 'password'
    component.city = 'New York'
    component.phoneNumber = '1234567890'

    component.role = "ROLE_RIDER"

    form.dispatchEvent(new Event('submit'))

    await fixture.whenStable()

    expect(component.error).toEqual('')
    expect(router.navigate).toHaveBeenCalledWith([`auth/signup/${component.email}`])
  })

  it('should navigate to create driver page', async () => {
    const userId = 1
    spyOn(auth, 'signUp').and.returnValue(Promise.resolve(userId))
    spyOn(router, 'navigate')

    component.firstName = 'John'
    component.lastName = 'Doe'
    component.email = "john@example.com"
    component.password = 'password'
    component.city = 'New York'
    component.phoneNumber = '1234567890'

    component.role = "ROLE_DRIVER"

    form.dispatchEvent(new Event('submit'))

    await fixture.whenStable()

    expect(component.error).toEqual('')
    expect(router.navigate).toHaveBeenCalledWith([`auth/signup/${userId}/car`])
  })

})