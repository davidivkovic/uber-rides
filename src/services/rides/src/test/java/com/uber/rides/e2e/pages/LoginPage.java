package com.uber.rides.e2e.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {

    WebDriver driver;
    WebDriverWait wait;

    public LoginPage(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public void navigate(String spaUrl) {
        driver.navigate().to(spaUrl + "/auth/login");
    }

    public void login(String email, String password) {
        var emailInputXpath = By.xpath("//input[@name='email']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(emailInputXpath));
        var emailInput = driver.findElement(emailInputXpath);
        emailInput.sendKeys(email);

        var passwordInputXpath = By.xpath("//input[@name='password']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(passwordInputXpath));
        var passwordInput = driver.findElement(passwordInputXpath);
        passwordInput.sendKeys(password);

        var loginButtonXpath = By.xpath("//button[@type='submit']");
        wait.until(ExpectedConditions.visibilityOfElementLocated(loginButtonXpath));
        wait.ignoring(StaleElementReferenceException.class).until(ExpectedConditions.elementToBeClickable(loginButtonXpath));
        driver.findElement(loginButtonXpath).click();
    }

    public boolean hasError() {
        var errorId = By.id("login-error");
        wait.until(ExpectedConditions.visibilityOfElementLocated(errorId));
        return driver.findElement(errorId).isDisplayed();
    }

    public boolean hasRedirected() {
        wait.until((d) -> !d.getCurrentUrl().contains("auth/login"));
        return !driver.getCurrentUrl().contains("auth/login");
    }

}